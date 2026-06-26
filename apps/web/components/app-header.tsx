"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PlusCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogIngestionSetupDialog } from "@/components/observability/log-ingestion-setup-dialog"
import { getDashboardById } from "@/lib/dashboards/mock-data"

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/logs": "Logs",
  "/dashboard/dashboards": "Dashboards",
  "/dashboard/assist": "Assist",
}

const ENVIRONMENTS = [
  {
    id: "production",
    label: "Production",
    dot: "bg-primary shadow-[0_0_0_2px_color-mix(in_oklab,var(--background)_92%,transparent)]",
  },
  {
    id: "staging",
    label: "Staging",
    dot: "bg-amber-500/90 shadow-[0_0_0_2px_color-mix(in_oklab,var(--background)_92%,transparent)]",
  },
  {
    id: "development",
    label: "Development",
    dot: "bg-sky-500/90 shadow-[0_0_0_2px_color-mix(in_oklab,var(--background)_92%,transparent)]",
  },
]

export function AppHeader() {
  const pathname = usePathname()
  const title = resolveTitle(pathname)
  const showIngestion = pathname.startsWith("/dashboard/logs")
  const isDashboardsView = Boolean(
    pathname.match(/^\/dashboard\/dashboards\/[^/]+$/)
  )
  const isAssistView = pathname.startsWith("/dashboard/assist")
  const [env, setEnv] = React.useState(ENVIRONMENTS[0])
  const [ingestionOpen, setIngestionOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <Breadcrumb
        className={cn(
          "hidden min-w-0 md:block",
          (isDashboardsView || isAssistView) && "md:hidden"
        )}
      >
        <BreadcrumbList className="gap-1 sm:gap-1.5">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/"
                className="text-[13px] font-medium text-muted-foreground"
              >
                Logify
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-muted-foreground/45 [&>svg]:size-3" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[13.5px] font-semibold tracking-tight">
              {title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <span
        className={cn(
          "min-w-0 truncate text-[13.5px] font-semibold tracking-tight",
          // On md+ the breadcrumb shows the title; only fall back to this plain
          // label on mobile, except in the dashboards/assist views where the
          // breadcrumb is hidden and this is the sole title.
          !(isDashboardsView || isAssistView) && "md:hidden"
        )}
      >
        {title}
      </span>

      <div className="ml-auto flex items-center gap-2">
        {showIngestion ? (
          <Button
            size="sm"
            variant="default"
            className="h-8 gap-1.5 px-3 text-[12.5px] font-medium"
            onClick={() => setIngestionOpen(true)}
          >
            <PlusCircleIcon /> New
          </Button>
        ) : null}
      </div>

      <LogIngestionSetupDialog
        open={ingestionOpen}
        onOpenChange={setIngestionOpen}
      />
    </header>
  )
}

function resolveTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname]

  const dashMatch = pathname.match(/^\/dashboard\/dashboards\/([^/]+)$/)
  if (dashMatch) {
    return getDashboardById(dashMatch[1])?.name ?? "Dashboard"
  }

  return toTitle(pathname)
}

function toTitle(path: string) {
  const seg = path.split("/").findLast(Boolean) ?? ""
  return seg.charAt(0).toUpperCase() + seg.slice(1)
}
