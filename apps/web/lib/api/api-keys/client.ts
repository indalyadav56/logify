import { apiRequest } from "@/lib/api/http"

export type ProjectApiKey = {
  id: string
  project_id: string
  name: string
  key_prefix: string
  created_at: string
  revoked_at: string | null
}

export type CreatedApiKey = ProjectApiKey & { key: string }

export function listApiKeys(projectId: string): Promise<ProjectApiKey[]> {
  return apiRequest<ProjectApiKey[]>(`/v1/projects/${projectId}/api-keys`)
}

export function createApiKey(projectId: string, name: string): Promise<CreatedApiKey> {
  return apiRequest<CreatedApiKey>(`/v1/projects/${projectId}/api-keys`, {
    method: "POST",
    body: { name },
  })
}

export function revokeApiKey(projectId: string, keyId: string): Promise<void> {
  return apiRequest<void>(`/v1/projects/${projectId}/api-keys/${keyId}`, { method: "DELETE" })
}
