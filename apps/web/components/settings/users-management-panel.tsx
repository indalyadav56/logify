"use client"

import * as React from "react"
import {
  MailIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  UserXIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useProjectStore } from "@/lib/project-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { InviteUserDialog } from "@/components/settings/invite-user-dialog"
import { SettingsSection } from "@/components/settings/settings-section"
import { MOCK_INVITES, MOCK_ROLES, MOCK_USERS } from "@/lib/settings/mock-data"
import type { ProjectMember, ProjectMemberInvite, UserStatus } from "@/lib/settings/types"

function formatRelative(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const STATUS_STYLES: Record<UserStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  invited: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  suspended: "bg-muted text-muted-foreground",
}

function createInviteId() {
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function UsersManagementPanel() {
  const { project: activeProject } = useProjectStore()
  const project = activeProject ?? {
    id: "",
    name: "your project",
    role: "Member",
    initials: "—",
  }
  const [users, setUsers] = React.useState(MOCK_USERS)
  const [invites, setInvites] = React.useState(MOCK_INVITES)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [inviteOpen, setInviteOpen] = React.useState(false)

  const projectUsers = React.useMemo(
    () => users.filter((u) => u.projectId === project.id),
    [users, project.id]
  )

  const projectInvites = React.useMemo(
    () => invites.filter((inv) => inv.projectId === project.id),
    [invites, project.id]
  )

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return projectUsers.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false
      if (!q) return true
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roleName.toLowerCase().includes(q)
      )
    })
  }, [projectUsers, search, statusFilter])

  const changeRole = (userId: string, roleId: string) => {
    const role = MOCK_ROLES.find((r) => r.id === roleId)
    if (!role) return
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, roleId, roleName: role.name } : u
      )
    )
    toast.success("Role updated for this project")
  }

  const handleInvited = (
    payload: Omit<ProjectMemberInvite, "id" | "createdAt" | "expiresAt">
  ) => {
    const now = new Date()
    const expires = new Date(now)
    expires.setDate(expires.getDate() + 7)

    setInvites((prev) => [
      ...prev,
      {
        ...payload,
        id: createInviteId(),
        createdAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      },
    ])
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold">
          {project.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-foreground">
            {project.name}
          </p>
          <p className="text-[12px] text-muted-foreground">
            Members and invitations are scoped to this project only.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10.5px]">
          {filtered.length} member{filtered.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <SettingsSection
        title="Members"
        description={`People with access to ${project.name}.`}
        action={
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setInviteOpen(true)}
          >
            <PlusIcon className="size-3.5" />
            Invite to project
          </Button>
        }
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-[13px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-full text-[13px] sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-4 py-10 text-center">
            <p className="text-[13px] font-medium text-foreground">
              No members in this project yet
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Invite someone to collaborate on {project.name}.
            </p>
            <Button
              size="sm"
              className="mt-4 h-8 gap-1.5"
              onClick={() => setInviteOpen(true)}
            >
              <PlusIcon className="size-3.5" />
              Invite to project
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[12px]">Member</TableHead>
                    <TableHead className="text-[12px]">Project role</TableHead>
                    <TableHead className="text-[12px]">Status</TableHead>
                    <TableHead className="text-[12px]">Last active</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onChangeRole={changeRole}
                      onSuspend={() =>
                        toast.message("Member suspended", {
                          description: user.email,
                        })
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Showing {filtered.length} of {projectUsers.length} members in{" "}
              {project.name}
            </p>
          </>
        )}
      </SettingsSection>

      {projectInvites.length > 0 ? (
        <SettingsSection
          title="Pending invitations"
          description={`Invites awaiting acceptance for ${project.name}.`}
        >
          <ul className="divide-y divide-border/60 rounded-md border border-border">
            {projectInvites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <MailIcon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">
                      {inv.email}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {inv.roleName} · invited by {inv.invitedBy}
                      {inv.permissions?.length
                        ? " · custom permissions"
                        : null}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-11 sm:pl-0">
                  <span className="text-[11px] text-muted-foreground">
                    Expires {formatRelative(inv.expiresAt)}
                  </span>
                  <Button variant="ghost" size="xs" className="h-7 text-[12px]">
                    Resend
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-7 text-[12px] text-destructive"
                  >
                    Revoke
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </SettingsSection>
      ) : null}

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={handleInvited}
      />
    </div>
  )
}

function UserRow({
  user,
  onChangeRole,
  onSuspend,
}: {
  user: ProjectMember
  onChangeRole: (userId: string, roleId: string) => void
  onSuspend: () => void
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium">{user.fullName}</p>
          <p className="truncate text-[12px] text-muted-foreground">
            {user.email}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <Select
          value={user.roleId}
          onValueChange={(v) => onChangeRole(user.id, v)}
        >
          <SelectTrigger className="h-8 w-[130px] text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOCK_ROLES.map((r) => (
              <SelectItem key={r.id} value={r.id} className="text-[12px]">
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={cn(
            "rounded-md text-[10px] font-medium",
            STATUS_STYLES[user.status]
          )}
        >
          {user.status}
        </Badge>
      </TableCell>
      <TableCell className="text-[12px] text-muted-foreground tabular-nums-lining">
        {formatRelative(user.lastActiveAt)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs" className="size-8">
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View activity</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onSuspend}>
              <UserXIcon className="size-3.5" />
              Remove from project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
