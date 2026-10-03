import type { ApiProject } from "@/lib/api/projects"

export type ProjectRole = ApiProject["role"]

export function canManageProject(role: ProjectRole): boolean {
  return role === "owner" || role === "admin"
}

export function roleLabel(role: ProjectRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export type ProjectSummary = {
  id: string
  name: string
  role: ProjectRole
  initials: string
  description?: string
}

/** Two-letter initials from a project name (e.g. "Acme Platform" → "AP"). */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) {
    const word = parts[0]
    return word.length >= 2
      ? word.slice(0, 2).toUpperCase()
      : (word[0] + word[0]).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Project permissions come from the backend membership, never the JWT role. */
export function projectFromApi(api: ApiProject): ProjectSummary {
  return {
    id: api.id,
    name: api.name,
    role: api.role ?? "viewer",
    initials: initialsFromName(api.name),
    description: api.description,
  }
}
