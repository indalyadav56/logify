"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronRightIcon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreateRoleDialog } from "@/components/settings/create-role-dialog"
import { SettingsSection } from "@/components/settings/settings-section"
import { MOCK_ROLES } from "@/lib/settings/mock-data"
import { countPermissions } from "@/lib/settings/permission-utils"

export function RolesManagementPanel() {
  const [roles] = React.useState(MOCK_ROLES)
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return roles
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    )
  }, [roles, search])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <SettingsSection
        title="Roles"
        description="Define what members can do. Assign roles from the Users page."
        action={
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <PlusIcon className="size-3.5" />
            Create role
          </Button>
        }
      >
        <div className="mb-4">
          <div className="relative max-w-md">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search roles"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-[13px]"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px]">Role</TableHead>
                <TableHead className="text-[12px]">Members</TableHead>
                <TableHead className="text-[12px]">Permissions</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((role) => (
                <TableRow key={role.id} className="group">
                  <TableCell>
                    <Link
                      href={`/dashboard/settings/roles/${role.id}`}
                      className="flex min-w-0 items-start gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {role.isSystem ? (
                          <LockIcon className="size-3.5" />
                        ) : (
                          <ShieldIcon className="size-3.5" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-[13px] font-medium text-foreground group-hover:text-primary">
                            {role.name}
                          </span>
                          {role.isSystem ? (
                            <Badge
                              variant="secondary"
                              className="h-5 rounded-md px-1.5 text-[10px] font-medium"
                            >
                              System
                            </Badge>
                          ) : null}
                        </span>
                        <span className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">
                          {role.description}
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums-lining text-[13px] text-muted-foreground">
                    {role.memberCount}
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">
                    {countPermissions(role.permissions)} grants
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-8"
                      asChild
                    >
                      <Link
                        href={`/dashboard/settings/roles/${role.id}`}
                        aria-label={`Edit ${role.name}`}
                      >
                        <ChevronRightIcon className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Permission model"
        description="Resources and actions aligned with the Logify API."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoCard
            title="Resources"
            items={[
              "Logs, projects, alerts",
              "Notifications, users, roles",
              "Organization, billing",
            ]}
          />
          <InfoCard
            title="Actions"
            items={[
              "Read — view data",
              "Write — create and update",
              "Delete — remove records",
              "Manage — full control",
            ]}
          />
        </div>
      </SettingsSection>

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/15 px-4 py-3">
      <p className="text-[12px] font-semibold text-foreground">{title}</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        {items.map((item) => (
          <li key={item} className="text-[12px] text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
