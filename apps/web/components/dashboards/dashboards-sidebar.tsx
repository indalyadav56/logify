"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutTemplateIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  UploadIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateDashboardDialog } from "@/components/dashboards/create-dashboard-dialog"
import { getRecentDashboards } from "@/lib/dashboards/mock-data"
import { useDashboardsStore } from "@/lib/dashboards/dashboards-store"

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hrs = Math.floor(diff / 3_600_000)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function dashboardHref(id: string) {
  return `/dashboard/dashboards/${id}`
}

export function DashboardsSidebar({ activeId }: { activeId: string }) {
  const router = useRouter()
  const { dashboards, createDashboard } = useDashboardsStore()
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)

  const recent = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = [...dashboards]
      .filter((d) => !d.isTemplate)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    if (!q) return list.slice(0, 8)
    return list.filter((d) => d.name.toLowerCase().includes(q))
  }, [dashboards, search])

  const handleCreated = (name: string) => {
    const dash = createDashboard(name)
    router.push(dashboardHref(dash.id))
  }

  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-border bg-muted/10">
      <div className="border-b border-border/60 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold text-foreground">
            Dashboards
          </h2>
          <div className="flex gap-0.5">
            <Button
              size="icon-xs"
              variant="ghost"
              className="size-7"
              aria-label="Import dashboard"
              title="Import (coming soon)"
            >
              <UploadIcon className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              className="size-7"
              onClick={() => setCreateOpen(true)}
              aria-label="New dashboard"
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          className="mt-2 h-8 w-full gap-1.5 text-[12px]"
          onClick={() => setCreateOpen(true)}
        >
          <PlusIcon className="size-3.5" />
          Dashboard
        </Button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dashboards"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-[12px]"
          />
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2">
        <p className="px-2 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Recent
        </p>
        <ul className="space-y-0.5">
          {recent.map((dash) => {
            const href = dashboardHref(dash.id)
            const active = activeId === dash.id
            return (
              <li key={dash.id}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col rounded-md px-2.5 py-2 transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/60"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {dash.isFavorite ? (
                      <StarIcon className="size-3 shrink-0 fill-current opacity-70" />
                    ) : null}
                    <span className="truncate text-[13px] font-medium">
                      {dash.name}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 text-[11px]",
                      active
                        ? "text-primary/70"
                        : "text-muted-foreground"
                    )}
                  >
                    Updated {formatRelative(dash.updatedAt)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="mt-4 px-2 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Templates
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link
              href={dashboardHref(
                getRecentDashboards(1)[0]?.id ?? "dash-platform-health"
              )}
              className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[12px] text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            >
              <LayoutTemplateIcon className="size-3.5" />
              Ready-made layouts
            </Link>
          </li>
        </ul>
      </nav>

      <CreateDashboardDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </aside>
  )
}
