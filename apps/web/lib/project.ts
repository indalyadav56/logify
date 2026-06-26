import type { ApiProject } from "@/lib/api/projects"

export type ProjectSummary = {
  id: string
  name: string
  role: string
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

/**
 * Map an API project to the UI summary. The project API has no per-project
 * role, so we use the signed-in user's tenant role (falling back to "Member").
 */
export function projectFromApi(
  api: ApiProject,
  role = "Member"
): ProjectSummary {
  return {
    id: api.id,
    name: api.name,
    role,
    initials: initialsFromName(api.name),
    description: api.description,
  }
}
