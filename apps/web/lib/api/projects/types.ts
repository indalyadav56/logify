/** Mirrors the backend `ProjectOutput` (snake_case JSON). */
export type ApiProject = {
  id: string
  tenant_id: string
  name: string
  role: "owner" | "admin" | "member" | "viewer"
  description?: string
  created_at: string
  updated_at: string
}

export type CreateProjectInput = {
  name: string
  description?: string
}

export type UpdateProjectInput = {
  name?: string
  description?: string
}
