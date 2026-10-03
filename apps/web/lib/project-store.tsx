"use client"

import * as React from "react"

import { useAuth } from "@/lib/auth-store"
import {
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  listProjects,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/api/projects"
import { projectFromApi, type ProjectSummary } from "@/lib/project"

const STORAGE_KEY = "logify:current-project-id"

type ProjectStatus = "loading" | "ready" | "error"

type ProjectStoreValue = {
  projects: ProjectSummary[]
  /** The active project, or `null` when no projects are accessible. */
  project: ProjectSummary | null
  status: ProjectStatus
  error: string | null
  setProject: (project: ProjectSummary) => void
  createProject: (input: CreateProjectInput) => Promise<ProjectSummary>
  updateProject: (id: string, input: UpdateProjectInput) => Promise<ProjectSummary>
  refresh: () => Promise<void>
  /** Shared create-project dialog visibility (openable from anywhere). */
  createOpen: boolean
  setCreateOpen: (open: boolean) => void
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

function saveProjectId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* localStorage may be unavailable */
  }
}

export function ProjectStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { status: authStatus } = useAuth()
  const [projects, setProjects] = React.useState<ProjectSummary[]>([])
  const [project, setProjectState] = React.useState<ProjectSummary | null>(null)
  const [status, setStatus] = React.useState<ProjectStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)

  /** Pick the active project: saved id if present, else the first. */
  const selectInitial = React.useCallback((list: ProjectSummary[]) => {
    const savedId = loadProjectId()
    const match = savedId ? list.find((p) => p.id === savedId) : undefined
    setProjectState(match ?? list[0] ?? null)
  }, [])

  const loadProjects = React.useCallback(() => {
    return listProjects().then(items => {
      const mapped = items.map((p) => projectFromApi(p))
      setProjects(mapped)
      selectInitial(mapped)
      setError(null)
      setStatus("ready")
    }).catch(err => {
      // No fake data — surface the empty/error state and let the UI handle it.
      setProjects([])
      setProjectState(null)
      setError(err instanceof Error ? err.message : "Failed to load projects.")
      setStatus("error")
    })
  }, [selectInitial])

  const refresh = React.useCallback(async () => {
    setStatus("loading")
    setError(null)
    await loadProjects()
  }, [loadProjects])

  React.useEffect(() => {
    if (authStatus !== "authenticated") return
    void loadProjects()
  }, [authStatus, loadProjects])

  // Recheck shared access when returning to the app after a team change.
  React.useEffect(() => {
    if (authStatus !== "authenticated") return
    const onFocus = () => { void loadProjects() }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [authStatus, loadProjects])

  const setProject = React.useCallback((next: ProjectSummary) => {
    setProjectState(next)
    saveProjectId(next.id)
  }, [])

  const createProject = React.useCallback(
    async (input: CreateProjectInput) => {
      const created = await apiCreateProject(input)
      const summary = projectFromApi(created)
      setProjects((prev) => [...prev, summary])
      setProjectState(summary)
      saveProjectId(summary.id)
      return summary
    },
    []
  )

  const updateProject = React.useCallback(
    async (id: string, input: UpdateProjectInput) => {
      const updated = await apiUpdateProject(id, input)
      const summary = projectFromApi(updated)
      setProjects(items => items.map(item => item.id === id ? summary : item))
      setProjectState(current => current?.id === id ? summary : current)
      return summary
    },
    []
  )

  const value = React.useMemo<ProjectStoreValue>(
    () => ({
      projects,
      project,
      status,
      error,
      setProject,
      createProject,
      updateProject,
      refresh,
      createOpen,
      setCreateOpen,
    }),
    [
      projects,
      project,
      status,
      error,
      setProject,
      createProject,
      updateProject,
      refresh,
      createOpen,
    ]
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
