"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon, LockIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RolePermissionsEditor } from "@/components/settings/role-permissions-editor"
import { SettingsSection } from "@/components/settings/settings-section"
import { getRoleById } from "@/lib/settings/mock-data"
import type { Permission, Role } from "@/lib/settings/types"

export function RoleDetailPanel({ roleId }: { roleId: string }) {
  const initial = getRoleById(roleId)
  const [role, setRole] = React.useState<Role | undefined>(initial)
  const [permissions, setPermissions] = React.useState<Permission[]>(
    initial?.permissions ?? []
  )

  if (!role) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <p className="text-[15px] font-medium">Role not found</p>
        <p className="text-[13px] text-muted-foreground">
          This role may have been removed or the link is invalid.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/settings/roles">Back to roles</Link>
        </Button>
      </div>
    )
  }

  const readOnly = role.isSystem

  const save = () => {
    if (readOnly) return
    toast.success("Role permissions saved")
  }

  const deleteRole = () => {
    if (readOnly) return
    toast.message("Role deleted", { description: role.name })
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-fit gap-1.5 px-2 text-[13px] text-muted-foreground"
          asChild
        >
          <Link href="/dashboard/settings/roles">
            <ArrowLeftIcon className="size-3.5" />
            Roles
          </Link>
        </Button>
        {!readOnly ? (
          <Button
            variant="destructive"
            size="sm"
            className="h-8 gap-1.5"
            onClick={deleteRole}
          >
            <Trash2Icon className="size-3.5" />
            Delete role
          </Button>
        ) : null}
      </div>

      <SettingsSection
        title={role.name}
        description={role.description}
        action={
          role.isSystem ? (
            <Badge
              variant="secondary"
              className="gap-1 rounded-md text-[11px] font-medium"
            >
              <LockIcon className="size-3" />
              System role
            </Badge>
          ) : null
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1.5 text-[12px]">Display name</Label>
            <Input
              value={role.name}
              disabled={readOnly}
              onChange={(e) => setRole({ ...role, name: e.target.value })}
              className="h-9 text-[13px]"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 text-[12px]">Description</Label>
            <Textarea
              value={role.description}
              disabled={readOnly}
              onChange={(e) =>
                setRole({ ...role, description: e.target.value })
              }
              className="min-h-[72px] resize-none text-[13px]"
            />
          </div>
        </div>
        <p className="mt-4 text-[12px] text-muted-foreground">
          {role.memberCount} member{role.memberCount === 1 ? "" : "s"} assigned
          · Updated {new Date(role.updatedAt).toLocaleDateString()}
        </p>
      </SettingsSection>

      <SettingsSection
        title="Permissions"
        description="Grant access per resource. Manage includes read, write, and delete."
        action={
          !readOnly ? (
            <Button size="sm" className="h-8" onClick={save}>
              Save permissions
            </Button>
          ) : null
        }
      >
        <RolePermissionsEditor
          permissions={permissions}
          onChange={setPermissions}
          readOnly={readOnly}
        />
      </SettingsSection>
    </div>
  )
}
