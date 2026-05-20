import type {
  AccountProfile,
  ApiKey,
  NotificationPreferences,
  OrganizationSettings,
  OrgUser,
  Role,
  UserInvite,
} from "@/lib/settings/types"

export const MOCK_ROLES: Role[] = [
  {
    id: "role-admin",
    name: "Admin",
    description: "Full access to organization resources and settings.",
    isSystem: true,
    memberCount: 2,
    permissions: [
      { resource: "log", action: "manage" },
      { resource: "project", action: "manage" },
      { resource: "alert", action: "manage" },
      { resource: "notification", action: "manage" },
      { resource: "user", action: "manage" },
      { resource: "role", action: "manage" },
      { resource: "tenant", action: "manage" },
      { resource: "billing", action: "manage" },
      { resource: "api_keys", action: "manage" },
    ],
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2026-03-01T12:00:00Z",
  },
  {
    id: "role-editor",
    name: "Editor",
    description: "Create and update logs, alerts, and dashboards.",
    isSystem: true,
    memberCount: 5,
    permissions: [
      { resource: "log", action: "write" },
      { resource: "project", action: "read" },
      { resource: "alert", action: "write" },
      { resource: "notification", action: "read" },
      { resource: "user", action: "read" },
      { resource: "api_keys", action: "read" },
    ],
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2026-02-14T09:30:00Z",
  },
  {
    id: "role-viewer",
    name: "Viewer",
    description: "Read-only access to logs and observability data.",
    isSystem: true,
    memberCount: 8,
    permissions: [
      { resource: "log", action: "read" },
      { resource: "project", action: "read" },
      { resource: "alert", action: "read" },
    ],
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-11-20T16:45:00Z",
  },
  {
    id: "role-sre",
    name: "SRE",
    description: "Operational access for on-call and incident response.",
    isSystem: false,
    memberCount: 3,
    permissions: [
      { resource: "log", action: "manage" },
      { resource: "alert", action: "write" },
      { resource: "notification", action: "write" },
      { resource: "project", action: "read" },
    ],
    createdAt: "2025-06-02T11:20:00Z",
    updatedAt: "2026-04-18T08:10:00Z",
  },
]

export const MOCK_USERS: OrgUser[] = [
  {
    id: "usr-1",
    email: "avery@logify.io",
    fullName: "Avery Moore",
    roleId: "role-admin",
    roleName: "Admin",
    status: "active",
    lastActiveAt: "2026-05-20T04:12:00Z",
    createdAt: "2025-01-10T08:00:00Z",
  },
  {
    id: "usr-2",
    email: "jordan.kim@acme.io",
    fullName: "Jordan Kim",
    roleId: "role-editor",
    roleName: "Editor",
    status: "active",
    lastActiveAt: "2026-05-19T22:40:00Z",
    createdAt: "2025-03-22T14:30:00Z",
  },
  {
    id: "usr-3",
    email: "sam.rivera@acme.io",
    fullName: "Sam Rivera",
    roleId: "role-sre",
    roleName: "SRE",
    status: "active",
    lastActiveAt: "2026-05-20T01:05:00Z",
    createdAt: "2025-08-01T09:15:00Z",
  },
  {
    id: "usr-4",
    email: "taylor.nguyen@acme.io",
    fullName: "Taylor Nguyen",
    roleId: "role-viewer",
    roleName: "Viewer",
    status: "active",
    lastActiveAt: "2026-05-18T16:20:00Z",
    createdAt: "2025-11-12T11:00:00Z",
  },
  {
    id: "usr-5",
    email: "casey.patel@acme.io",
    fullName: "Casey Patel",
    roleId: "role-viewer",
    roleName: "Viewer",
    status: "suspended",
    lastActiveAt: "2026-04-02T10:00:00Z",
    createdAt: "2026-01-05T13:45:00Z",
  },
]

export const MOCK_INVITES: UserInvite[] = [
  {
    id: "inv-1",
    email: "morgan.lee@acme.io",
    roleId: "role-editor",
    roleName: "Editor",
    invitedBy: "Avery Moore",
    expiresAt: "2026-05-27T10:00:00Z",
    createdAt: "2026-05-13T10:00:00Z",
  },
]

export const MOCK_ACCOUNT: AccountProfile = {
  fullName: "Avery Moore",
  email: "avery@logify.io",
  jobTitle: "Platform Engineering Lead",
  timezone: "America/Los_Angeles",
}

export const MOCK_ORG_SETTINGS: OrganizationSettings = {
  name: "Logify Production",
  slug: "logify-production",
  supportEmail: "platform@acme.io",
  defaultRetentionDays: 30,
  enforceMfa: true,
  allowMemberInvites: false,
}

export const MOCK_NOTIFICATIONS: NotificationPreferences = {
  alertDigest: true,
  weeklyReport: true,
  productUpdates: false,
  securityAlerts: true,
}

export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: "key-1",
    name: "Production ingestion",
    description: "Payments and checkout services",
    prefix: "lgfy_live_k8m2n9p4q7",
    status: "active",
    scopes: ["logs.ingest"],
    environment: "production",
    createdAt: "2025-11-08T14:20:00Z",
    createdBy: "Avery Moore",
    lastUsedAt: "2026-05-20T03:45:00Z",
    expiresAt: null,
  },
  {
    id: "key-2",
    name: "CI log export",
    prefix: "lgfy_live_x3j8w1r5t2",
    status: "active",
    scopes: ["logs.read", "projects.read"],
    environment: "production",
    createdAt: "2026-01-15T09:00:00Z",
    createdBy: "Jordan Kim",
    lastUsedAt: "2026-05-19T18:12:00Z",
    expiresAt: "2026-07-15T09:00:00Z",
  },
  {
    id: "key-3",
    name: "Staging agent",
    prefix: "lgfy_stg_h4v6c9m2n8",
    status: "active",
    scopes: ["logs.ingest", "logs.read"],
    environment: "staging",
    createdAt: "2026-03-01T11:30:00Z",
    createdBy: "Sam Rivera",
    lastUsedAt: "2026-05-18T22:00:00Z",
    expiresAt: null,
  },
  {
    id: "key-4",
    name: "Legacy monitoring",
    prefix: "lgfy_live_p9k2m7n4x1",
    status: "revoked",
    scopes: ["logs.read", "alerts.read"],
    environment: "production",
    createdAt: "2025-06-20T08:00:00Z",
    createdBy: "Avery Moore",
    lastUsedAt: "2026-04-10T12:00:00Z",
    expiresAt: null,
    revokedAt: "2026-05-01T10:00:00Z",
  },
]

export function getRoleById(id: string) {
  return MOCK_ROLES.find((r) => r.id === id)
}

export function getApiKeyById(id: string) {
  return MOCK_API_KEYS.find((k) => k.id === id)
}
