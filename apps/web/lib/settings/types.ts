export type Permission = {
  resource: string
  action: string
}

export type Role = {
  id: string
  name: string
  description: string
  isSystem: boolean
  memberCount: number
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export type UserStatus = "active" | "invited" | "suspended"

export type ProjectMember = {
  id: string
  projectId: string
  email: string
  fullName: string
  roleId: string
  roleName: string
  status: UserStatus
  lastActiveAt: string
  createdAt: string
}

/** @deprecated Use ProjectMember */
export type OrgUser = ProjectMember

export type ProjectMemberInvite = {
  id: string
  projectId: string
  projectName: string
  email: string
  roleId: string
  roleName: string
  invitedBy: string
  permissions?: Permission[]
  expiresAt: string
  createdAt: string
}

/** @deprecated Use ProjectMemberInvite */
export type UserInvite = ProjectMemberInvite

export type AccountProfile = {
  fullName: string
  email: string
  jobTitle: string
  timezone: string
}

export type OrganizationSettings = {
  name: string
  slug: string
  supportEmail: string
  defaultRetentionDays: number
  enforceMfa: boolean
  allowMemberInvites: boolean
}

export type NotificationPreferences = {
  alertDigest: boolean
  weeklyReport: boolean
  productUpdates: boolean
  securityAlerts: boolean
}

export type ApiKeyStatus = "active" | "revoked" | "expired"

export type ApiKeyScope =
  | "logs.ingest"
  | "logs.read"
  | "alerts.read"
  | "alerts.write"
  | "projects.read"
  | "admin"

export type ApiKeyEnvironment = "production" | "staging" | "development"

export type ApiKey = {
  id: string
  name: string
  description?: string
  prefix: string
  status: ApiKeyStatus
  scopes: ApiKeyScope[]
  environment: ApiKeyEnvironment
  createdAt: string
  createdBy: string
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt?: string
}
