import { apiRequest } from "@/lib/api/http"

import type {
  ApiProject,
  CreateProjectInput,
  UpdateProjectInput,
} from "./types"

/** GET /v1/projects — projects for the authenticated tenant. */
export function listProjects(): Promise<ApiProject[]> {
  return apiRequest<ApiProject[]>("/v1/projects").then((data) => data ?? [])
}

/** POST /v1/projects — tenant is injected from the JWT on the server. */
export function createProject(input: CreateProjectInput): Promise<ApiProject> {
  return apiRequest<ApiProject>("/v1/projects", {
    method: "POST",
    body: input,
  })
}

/** GET /v1/projects/:id */
export function getProject(id: string): Promise<ApiProject> {
  return apiRequest<ApiProject>(`/v1/projects/${id}`)
}

/** PUT /v1/projects/:id */
export function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<ApiProject> {
  return apiRequest<ApiProject>(`/v1/projects/${id}`, {
    method: "PUT",
    body: input,
  })
}

/** DELETE /v1/projects/:id */
export function deleteProject(id: string): Promise<void> {
  return apiRequest<void>(`/v1/projects/${id}`, { method: "DELETE" })
}
