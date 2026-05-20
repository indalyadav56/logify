/** Mirrors backend role domain permission catalog. */
export const PERMISSION_RESOURCES = [
  { id: "log", label: "Logs", description: "Search, export, and manage log data" },
  { id: "project", label: "Projects", description: "Workspaces and project configuration" },
  { id: "alert", label: "Alerts", description: "Alert rules and notification policies" },
  { id: "notification", label: "Notifications", description: "Channels and delivery settings" },
  { id: "user", label: "Users", description: "Invite and manage organization members" },
  { id: "role", label: "Roles", description: "Custom roles and permission assignments" },
  { id: "tenant", label: "Organization", description: "Org settings and billing profile" },
  { id: "billing", label: "Billing", description: "Plans, invoices, and usage" },
  {
    id: "api_keys",
    label: "API keys",
    description: "Programmatic access tokens for integrations",
  },
] as const

export const PERMISSION_ACTIONS = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "delete", label: "Delete" },
  { id: "manage", label: "Manage" },
] as const

export type PermissionResourceId =
  (typeof PERMISSION_RESOURCES)[number]["id"]

export type PermissionActionId = (typeof PERMISSION_ACTIONS)[number]["id"]

export function permissionKey(resource: string, action: string) {
  return `${resource}:${action}`
}

export function hasPermission(
  permissions: { resource: string; action: string }[],
  resource: string,
  action: string
) {
  return permissions.some(
    (p) =>
      p.resource === resource &&
      (p.action === action || p.action === "manage" || action === "read")
  )
}
