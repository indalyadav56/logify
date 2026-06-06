import { create } from "zustand"
import {
  users as seedUsers,
  type User,
  type UserRole,
  type UserStatus,
} from "@/lib/mock-data"

type Filters = {
  search: string
  role: UserRole | "all"
  status: UserStatus | "all"
  organizationId: string | "all"
}

type UsersState = {
  users: User[]
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  resetFilters: () => void
  invite: (input: { name: string; email: string; role: UserRole; organizationId: string }) => void
  updateRole: (id: string, role: UserRole) => void
  suspend: (id: string) => void
  reactivate: (id: string) => void
  remove: (id: string) => void
  filtered: () => User[]
}

const defaultFilters: Filters = {
  search: "",
  role: "all",
  status: "all",
  organizationId: "all",
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: seedUsers,
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
  invite: ({ name, email, role, organizationId }) =>
    set((s) => ({
      users: [
        {
          id: `user_${Date.now()}`,
          name,
          email,
          role,
          status: "invited",
          organizationId,
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        ...s.users,
      ],
    })),
  updateRole: (id, role) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, role } : u)),
    })),
  suspend: (id) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, status: "suspended" } : u)),
    })),
  reactivate: (id) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, status: "active" } : u)),
    })),
  remove: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
  filtered: () => {
    const { users, filters } = get()
    const q = filters.search.trim().toLowerCase()
    return users.filter((u) => {
      if (filters.role !== "all" && u.role !== filters.role) return false
      if (filters.status !== "all" && u.status !== filters.status) return false
      if (filters.organizationId !== "all" && u.organizationId !== filters.organizationId)
        return false
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q))
        return false
      return true
    })
  },
}))
