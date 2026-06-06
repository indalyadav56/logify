"use client"

import * as React from "react"

import { useAuth } from "@/lib/auth-store"
import {
  createProject as apiCreateProject,
  listProjects,
  type CreateProjectInput,
} from "@/lib/api/projects"
import {
  DEFAULT_PROJECTS,
  projectFromApi,
  type ProjectSummary,
} from "@/lib/project"

const STORAGE_KEY = "logify:current-project-id"

type ProjectStatus = "loading" | "ready" | "error"

type ProjectStoreValue = {
  projects: ProjectSummary[]
  /** The active project, or `null` when the tenant has none yet. */
  project: ProjectSummary | null
  status: ProjectStatus
  error: string | null
  setProject: (project: ProjectSummary) => void
  createProject: (input: CreateProjectInput) => Promise<ProjectSummary>
  refresh: () => Promise<void>
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

function roleLabel(role?: string): string {
  if (!role) return "Member"
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export function ProjectStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { status: authStatus, user } = useAuth()
  const [projects, setProjects] = React.useState<ProjectSummary[]>([])
  const [project, setProjectState] = React.useState<ProjectSummary | null>(null)
  const [status, setStatus] = React.useState<ProjectStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)

  const role = roleLabel(user?.role)

  /** Pick the active project: saved id if present, else the first. */
  const selectInitial = React.useCallback((list: ProjectSummary[]) => {
    const savedId = loadProjectId()
    const match = savedId ? list.find((p) => p.id === savedId) : undefined
    setProjectState(match ?? list[0] ?? null)
  }, [])

  const refresh = React.useCallback(async () => {
    setStatus("loading")
    setError(null)
    try {
      const items = await listProjects()
      const mapped = items.map((p) => projectFromApi(p, role))
      setProjects(mapped)
      selectInitial(mapped)
      setStatus("ready")
    } catch (err) {
      // Keep the demo usable when the backend is unreachable.
      setProjects(DEFAULT_PROJECTS)
      selectInitial(DEFAULT_PROJECTS)
      setError(err instanceof Error ? err.message : "Failed to load projects.")
      setStatus("error")
    }
  }, [role, selectInitial])

  React.useEffect(() => {
    if (authStatus !== "authenticated") return
    void refresh()
  }, [authStatus, refresh])

  const setProject = React.useCallback((next: ProjectSummary) => {
    setProjectState(next)
    saveProjectId(next.id)
  }, [])

  const createProject = React.useCallback(
    async (input: CreateProjectInput) => {
      const created = await apiCreateProject(input)
      const summary = projectFromApi(created, role)
      setProjects((prev) => [...prev, summary])
      setProjectState(summary)
      saveProjectId(summary.id)
      return summary
    },
    [role]
  )

  const value = React.useMemo<ProjectStoreValue>(
    () => ({
      projects,
      project,
      status,
      error,
      setProject,
      createProject,
      refresh,
    }),
    [projects, project, status, error, setProject, createProject, refresh]
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
