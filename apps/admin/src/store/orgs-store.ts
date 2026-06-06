import { create } from "zustand"
import {
  organizations as seedOrgs,
  type OrgPlan,
  type OrgStatus,
  type Organization,
} from "@/lib/mock-data"

type Filters = {
  search: string
  plan: OrgPlan | "all"
  status: OrgStatus | "all"
}

type OrgsState = {
  organizations: Organization[]
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  changePlan: (id: string, plan: OrgPlan) => void
  setStatus: (id: string, status: OrgStatus) => void
  byId: (id: string) => Organization | undefined
  filtered: () => Organization[]
}

const defaultFilters: Filters = { search: "", plan: "all", status: "all" }

export const useOrgsStore = create<OrgsState>((set, get) => ({
  organizations: seedOrgs,
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  changePlan: (id, plan) =>
    set((s) => ({
      organizations: s.organizations.map((o) => (o.id === id ? { ...o, plan } : o)),
    })),
  setStatus: (id, status) =>
    set((s) => ({
      organizations: s.organizations.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    })),
  byId: (id) => get().organizations.find((o) => o.id === id),
  filtered: () => {
    const { organizations, filters } = get()
    const q = filters.search.trim().toLowerCase()
    return organizations.filter((o) => {
      if (filters.plan !== "all" && o.plan !== filters.plan) return false
      if (filters.status !== "all" && o.status !== filters.status) return false
      if (q && !o.name.toLowerCase().includes(q) && !o.slug.includes(q)) return false
      return true
    })
  },
}))
