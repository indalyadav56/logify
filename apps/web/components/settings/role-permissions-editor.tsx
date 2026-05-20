"use client"

import * as React from "react"
import { InfoIcon, LockIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  type PermissionActionId,
} from "@/lib/settings/permissions-catalog"
import {
  isPermissionGranted,
  setPermission,
} from "@/lib/settings/permission-utils"
import type { Permission } from "@/lib/settings/types"

export function RolePermissionsEditor({
  permissions,
  onChange,
  readOnly = false,
}: {
  permissions: Permission[]
  onChange: (next: Permission[]) => void
  readOnly?: boolean
}) {
  const toggle = (resource: string, action: PermissionActionId) => {
    if (readOnly) return
    const enabled = !isPermissionGranted(permissions, resource, action)
    onChange(setPermission(permissions, resource, action, enabled))
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Resource
              </th>
              {PERMISSION_ACTIONS.map((action) => (
                <th
                  key={action.id}
                  className="w-[88px] px-2 py-2.5 text-center text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  {action.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_RESOURCES.map((resource, idx) => {
              const manageGranted = isPermissionGranted(
                permissions,
                resource.id,
                "manage"
              )

              return (
                <tr
                  key={resource.id}
                  className={cn(
                    "border-b border-border/60 last:border-0",
                    idx % 2 === 1 && "bg-muted/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground">
                          {resource.label}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                          {resource.description}
                        </p>
                      </div>
                      {readOnly ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="mt-0.5 shrink-0 text-muted-foreground">
                              <LockIcon className="size-3.5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>System role — read only</TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  </td>
                  {PERMISSION_ACTIONS.map((action) => {
                    const granted = isPermissionGranted(
                      permissions,
                      resource.id,
                      action.id
                    )
                    const disabled =
                      readOnly ||
                      (manageGranted && action.id !== "manage")

                    return (
                      <td key={action.id} className="px-2 py-3 text-center">
                        <Checkbox
                          checked={granted}
                          disabled={disabled}
                          onCheckedChange={() =>
                            toggle(resource.id, action.id)
                          }
                          aria-label={`${resource.label} ${action.label}`}
                          className="mx-auto"
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {readOnly ? (
        <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 px-4 py-2.5 text-[12px] text-muted-foreground">
          <InfoIcon className="size-3.5 shrink-0" />
          Built-in roles cannot be modified. Duplicate a role to customize
          permissions.
        </div>
      ) : null}
    </div>
  )
}
