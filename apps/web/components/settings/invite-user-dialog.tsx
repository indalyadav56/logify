"use client"

import * as React from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useProjectStore } from "@/lib/project-store"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MOCK_ROLES } from "@/lib/settings/mock-data"
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "@/lib/settings/permissions-catalog"
import {
  isPermissionGranted,
  setPermission,
} from "@/lib/settings/permission-utils"
import type { Permission, ProjectMemberInvite } from "@/lib/settings/types"

type InvitePayload = Omit<ProjectMemberInvite, "id" | "createdAt" | "expiresAt">

export function InviteUserDialog({
  open,
  onOpenChange,
  onInvited,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited?: (invite: InvitePayload) => void
}) {
  const { project: activeProject, projects } = useProjectStore()
  const currentProject = activeProject ??
    projects[0] ?? {
      id: "",
      name: "your project",
      role: "Member",
      initials: "—",
    }
  const [selectedProjectId, setSelectedProjectId] = React.useState(
    currentProject.id
  )
  const [email, setEmail] = React.useState("")
  const [roleId, setRoleId] = React.useState(MOCK_ROLES[1]?.id ?? "")
  const [customizePermissions, setCustomizePermissions] = React.useState(false)
  const [permissions, setPermissions] = React.useState<Permission[]>([])

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ?? currentProject

  const reset = () => {
    setSelectedProjectId(currentProject.id)
    setEmail("")
    setRoleId(MOCK_ROLES[1]?.id ?? "")
    setCustomizePermissions(false)
    setPermissions([])
  }

  React.useEffect(() => {
    if (open) {
      setSelectedProjectId(currentProject.id)
    }
  }, [open, currentProject.id])

  React.useEffect(() => {
    const selectedRole = MOCK_ROLES.find((r) => r.id === roleId)
    if (selectedRole) {
      setPermissions(selectedRole.permissions)
    }
  }, [roleId])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Enter an email address")
      return
    }

    const role = MOCK_ROLES.find((r) => r.id === roleId)
    const roleName = role?.name ?? "Custom"
    const permDesc = customizePermissions
      ? "with custom permissions"
      : `as ${roleName}`

    const payload: InvitePayload = {
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      email: email.trim(),
      roleId,
      roleName,
      invitedBy: "Avery Moore",
      permissions: customizePermissions ? [...permissions] : undefined,
    }

    onInvited?.(payload)

    toast.success("Invitation sent", {
      description: `${email.trim()} invited to ${selectedProject.name} ${permDesc}.`,
    })
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Invite project member</DialogTitle>
            <DialogDescription>
              Add a member to a project. They will get access to logs,
              dashboards, and settings scoped to that project only.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <Label className="mb-1.5 text-[12px]">Project</Label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger className="h-10 w-full text-[13px]">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-[13px]">
                      <span className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[9px] font-semibold">
                          {p.initials}
                        </span>
                        <span className="flex flex-col items-start">
                          <span>{p.name}</span>
                          <span className="text-[10.5px] text-muted-foreground">
                            {p.id}
                          </span>
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                The invite applies only to {selectedProject.name}.
              </p>
            </div>

            <div>
              <Label className="mb-1.5 text-[12px]">Email</Label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-[13px]"
                required
              />
            </div>
            <div>
              <Label className="mb-1.5 text-[12px]">Role in this project</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="h-9 w-full text-[13px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ROLES.map((role) => (
                    <SelectItem
                      key={role.id}
                      value={role.id}
                      className="text-[13px]"
                    >
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Role applies only within {selectedProject.name}, not other
                projects.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <div className="space-y-0.5">
                <Label className="text-[12.5px] font-medium">
                  Customize permissions
                </Label>
                <p className="text-[11.5px] text-muted-foreground">
                  Override the role defaults for this project member
                </p>
              </div>
              <Switch
                checked={customizePermissions}
                onCheckedChange={setCustomizePermissions}
              />
            </div>

            {customizePermissions ? (
              <div className="max-h-[220px] space-y-3.5 overflow-y-auto rounded-md border border-border bg-muted/5 p-3">
                {PERMISSION_RESOURCES.map((resource) => {
                  const manageGranted = isPermissionGranted(
                    permissions,
                    resource.id,
                    "manage"
                  )
                  return (
                    <div
                      key={resource.id}
                      className="flex flex-col gap-1.5 border-b border-border/40 pb-2.5 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-[12.5px] font-semibold leading-tight text-foreground">
                          {resource.label}
                        </p>
                        <p className="text-[11px] leading-normal text-muted-foreground">
                          {resource.description}
                        </p>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5">
                        {PERMISSION_ACTIONS.map((action) => {
                          const granted = isPermissionGranted(
                            permissions,
                            resource.id,
                            action.id
                          )
                          const disabled =
                            manageGranted && action.id !== "manage"
                          return (
                            <label
                              key={action.id}
                              className={cn(
                                "inline-flex cursor-pointer items-center gap-1.5 text-[11.5px] selection:bg-transparent",
                                disabled && "cursor-not-allowed opacity-50"
                              )}
                            >
                              <Checkbox
                                checked={granted}
                                disabled={disabled}
                                onCheckedChange={(checked) => {
                                  const enabled = checked === true
                                  setPermissions((prev) =>
                                    setPermission(
                                      prev,
                                      resource.id,
                                      action.id,
                                      enabled
                                    )
                                  )
                                }}
                              />
                              <span className="capitalize">{action.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Send project invitation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
