import { apiRequest } from "@/lib/api/http"
import type { ApiProject } from "@/lib/api/projects"
import type { ProjectRole } from "@/lib/project"

export type MemberRole = Exclude<ProjectRole, "owner">
export type TeamMember = {
  user_id: string
  full_name: string
  email: string
  role: ProjectRole
  joined_at: string
}
export type TeamInvitation = {
  id: string
  project_id: string
  project_name: string
  email: string
  role: MemberRole
  created_at: string
  expires_at: string
  status: "pending" | "accepted" | "expired" | "canceled"
}
export type ProjectTeam = {
  members: TeamMember[]
  invitations: TeamInvitation[]
  role: ProjectRole
}
export type CreatedInvitation = TeamInvitation & { token: string }

export function getTeam(projectId: string): Promise<ProjectTeam> {
  return apiRequest(`/v1/projects/${projectId}/team`)
}
export function createInvitation(projectId: string, email: string, role: MemberRole): Promise<CreatedInvitation> {
  return apiRequest(`/v1/projects/${projectId}/invitations`, { method: "POST", body: { email, role } })
}
export function cancelInvitation(projectId: string, id: string): Promise<void> {
  return apiRequest(`/v1/projects/${projectId}/invitations/${id}`, { method: "DELETE" })
}
export function changeMemberRole(projectId: string, userId: string, role: MemberRole): Promise<void> {
  return apiRequest(`/v1/projects/${projectId}/members/${userId}`, { method: "PATCH", body: { role } })
}
export function removeMember(projectId: string, userId: string): Promise<void> {
  return apiRequest(`/v1/projects/${projectId}/members/${userId}`, { method: "DELETE" })
}
export function previewInvitation(token: string): Promise<TeamInvitation> {
  return apiRequest("/v1/invitations/preview", { method: "POST", body: { token } })
}
export function acceptInvitation(token: string): Promise<ApiProject> {
  return apiRequest("/v1/invitations/accept", { method: "POST", body: { token } })
}
