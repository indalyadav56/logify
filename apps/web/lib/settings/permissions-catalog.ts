/** Mirrors backend role domain permission catalog. */
export const PERMISSION_RESOURCES = [
  { id: "log", label: "Logs", description: "Search, export, and manage log data" },
  { id: "project", label: "Projects", description: "Project settings and configuration" },
  { id: "alert", label: "Alerts", description: "Alert rules and notification policies" },
  { id: "notification", label: "Notifications", description: "Channels and delivery settings" },
  { id: "user", label: "Project Members", description: "Invite and manage project members and permissions" },
  { id: "role", label: "Roles", description: "Custom roles and permission assignments" },
  { id: "tenant", label: "Project Profile", description: "Project general settings and billing" },
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
