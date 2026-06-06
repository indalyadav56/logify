import { create } from "zustand"
import { projects as seedProjects, type Project } from "@/lib/mock-data"

type Filters = {
  search: string
  environment: Project["environment"] | "all"
  organizationId: string | "all"
}

type ProjectsState = {
  projects: Project[]
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  remove: (id: string) => void
  setRetention: (id: string, days: number) => void
  filtered: () => Project[]
}

const defaultFilters: Filters = {
  search: "",
  environment: "all",
  organizationId: "all",
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: seedProjects,
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  remove: (id) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
  setRetention: (id, days) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, retentionDays: days } : p
      ),
    })),
  filtered: () => {
    const { projects, filters } = get()
    const q = filters.search.trim().toLowerCase()
    return projects.filter((p) => {
      if (filters.environment !== "all" && p.environment !== filters.environment)
        return false
      if (
        filters.organizationId !== "all" &&
        p.organizationId !== filters.organizationId
      )
        return false
      if (q && !p.name.toLowerCase().includes(q)) return false
      return true
    })
  },
}))
