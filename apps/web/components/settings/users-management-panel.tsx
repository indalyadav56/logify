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
import type { OrgUser, UserStatus } from "@/lib/settings/types"

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

export function UsersManagementPanel() {
  const [users, setUsers] = React.useState(MOCK_USERS)
  const [invites] = React.useState(MOCK_INVITES)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [inviteOpen, setInviteOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false
      if (!q) return true
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roleName.toLowerCase().includes(q)
      )
    })
  }, [users, search, statusFilter])

  const changeRole = (userId: string, roleId: string) => {
    const role = MOCK_ROLES.find((r) => r.id === roleId)
    if (!role) return
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, roleId, roleName: role.name } : u
      )
    )
    toast.success("Role updated")
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <SettingsSection
        title="Members"
        description="Manage who has access to this organization."
        action={
          <Button size="sm" className="h-8 gap-1.5" onClick={() => setInviteOpen(true)}>
            <PlusIcon className="size-3.5" />
            Invite user
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
            <SelectTrigger className="h-9 w-full sm:w-[140px] text-[13px]">
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

        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px]">User</TableHead>
                <TableHead className="text-[12px]">Role</TableHead>
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
                    toast.message("User suspended", { description: user.email })
                  }
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">
          Showing {filtered.length} of {users.length} members
        </p>
      </SettingsSection>

      {invites.length > 0 ? (
        <SettingsSection
          title="Pending invitations"
          description="Invites that have not been accepted yet."
        >
          <ul className="divide-y divide-border/60 rounded-md border border-border">
            {invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <MailIcon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{inv.email}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {inv.roleName} · invited by {inv.invitedBy}
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

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}

function UserRow({
  user,
  onChangeRole,
  onSuspend,
}: {
  user: OrgUser
  onChangeRole: (userId: string, roleId: string) => void
  onSuspend: () => void
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium">{user.fullName}</p>
          <p className="truncate text-[12px] text-muted-foreground">{user.email}</p>
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
          className={cn("rounded-md text-[10px] font-medium", STATUS_STYLES[user.status])}
        >
          {user.status}
        </Badge>
      </TableCell>
      <TableCell className="tabular-nums-lining text-[12px] text-muted-foreground">
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
              Suspend user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
