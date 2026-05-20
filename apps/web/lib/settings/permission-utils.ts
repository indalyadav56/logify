import type { Permission } from "@/lib/settings/types"
import type { PermissionActionId } from "@/lib/settings/permissions-catalog"

export function isPermissionGranted(
  permissions: Permission[],
  resource: string,
  action: string
) {
  if (
    permissions.some((p) => p.resource === resource && p.action === "manage")
  ) {
    return true
  }
  return permissions.some(
    (p) => p.resource === resource && p.action === action
  )
}

export function setPermission(
  permissions: Permission[],
  resource: string,
  action: PermissionActionId,
  enabled: boolean
): Permission[] {
  const without = permissions.filter(
    (p) => !(p.resource === resource && p.action === action)
  )

  if (!enabled) {
    if (action === "manage") return without
    return without
  }

  if (action === "manage") {
    const rest = without.filter((p) => p.resource !== resource)
    return [...rest, { resource, action: "manage" }]
  }

  const hasManage = without.some(
    (p) => p.resource === resource && p.action === "manage"
  )
  if (hasManage) return permissions

  return [...without, { resource, action }]
}

export function countPermissions(permissions: Permission[]) {
  return permissions.length
}
