"use client"

import * as React from "react"

import { DEFAULT_PROJECTS, type ProjectSummary } from "@/lib/project"

const STORAGE_KEY = "logify:current-project-id"

type ProjectStoreValue = {
  projects: ProjectSummary[]
  project: ProjectSummary
  setProject: (project: ProjectSummary) => void
  addProject: (project: ProjectSummary) => void
}

const ProjectCtx = React.createContext<ProjectStoreValue | null>(null)

function loadProjectId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function ProjectStoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] =
    React.useState<ProjectSummary[]>(DEFAULT_PROJECTS)
  const [project, setProjectState] = React.useState<ProjectSummary>(
    DEFAULT_PROJECTS[0]
  )

  React.useEffect(() => {
    const savedId = loadProjectId()
    if (!savedId) return
    const match = DEFAULT_PROJECTS.find((p) => p.id === savedId)
    if (match) setProjectState(match)
  }, [])

  const setProject = React.useCallback((next: ProjectSummary) => {
    setProjectState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next.id)
    } catch {
      /* localStorage may be unavailable */
    }
  }, [])

  const addProject = React.useCallback((next: ProjectSummary) => {
    setProjects((prev) => [...prev, next])
    setProject(next)
  }, [setProject])

  const value = React.useMemo(
    () => ({ projects, project, setProject, addProject }),
    [projects, project, setProject, addProject]
  )

  return <ProjectCtx.Provider value={value}>{children}</ProjectCtx.Provider>
}

export function useProjectStore() {
  const ctx = React.useContext(ProjectCtx)
  if (!ctx) {
    throw new Error("useProjectStore must be used within ProjectStoreProvider")
  }
  return ctx
}
