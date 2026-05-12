"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"
import { Facets, type FacetGroup } from "@/components/observability/facets"
import { useLogsStore } from "@/lib/logs-store"
import { useLogsData } from "@/lib/logs-data-context"
import { type LogLevel } from "@/lib/mock-data"

const LEVELS: LogLevel[] = ["trace", "debug", "info", "warn", "error", "fatal"]
const LEVEL_COLOR: Record<LogLevel, string> = {
  trace: "#71717a",
  debug: "#0ea5e9",
  info: "#10b981",
  warn: "#f59e0b",
  error: "#ef4444",
  fatal: "#d946ef",
}

export function AppSidebar() {
  const { open, openMobile, isMobile } = useSidebar()
  const pathname = usePathname()
  const showsFacets = pathname.startsWith("/dashboard/logs")
  const visible = (isMobile ? openMobile : open) && showsFacets

  if (!showsFacets) return null

  return (
    <aside
      data-state={visible ? "open" : "closed"}
      className={cn(
        "hidden h-full shrink-0 overflow-hidden border-r border-border/60 bg-sidebar/40",
        "transition-[width] duration-200 ease-out",
        "data-[state=closed]:w-0 data-[state=open]:w-[272px]",
        "md:flex md:flex-col"
      )}
    >
      <div className="flex h-full w-[272px] min-h-0 flex-col overflow-hidden">
        <LogsFacetsContent />
      </div>
    </aside>
  )
}

function LogsFacetsContent() {
  const { selection, setSelection } = useLogsStore()
  const { logs: facetLogs, dataSource } = useLogsData()

  const groups = React.useMemo<FacetGroup[]>(() => {
    const baseGroups: FacetGroup[] = [
      {
        id: "level",
        label: "Status",
        pinned: true,
        values: LEVELS.map((l) => ({
          value: l,
          count: facetLogs.filter((x) => x.level === l).length,
          color: LEVEL_COLOR[l],
        })),
      },
      {
        id: "service",
        label: "Service",
        pinned: true,
        values: groupCount(facetLogs.map((l) => l.service)),
      },
      {
        id: "host",
        label: "Host",
        pinned: true,
        values: groupCount(facetLogs.map((l) => l.host)),
      },
      {
        id: "environment",
        label: "Environment",
        pinned: true,
        values: groupCount(facetLogs.map((l) => l.environment)),
      },
    ]

    const projectValues = groupCount(
      facetLogs
        .map((l) => String(l.attributes.project_id ?? "").trim())
        .filter(Boolean)
    )
    if (projectValues.length > 0) {
      baseGroups.push({
        id: "project_id",
        label: "Project",
        pinned: true,
        values: projectValues,
      })
    }

    const regionDyn = groupCount(
      facetLogs
        .map((l) => String(l.attributes.region ?? "").trim())
        .filter(Boolean)
    )

    if (dataSource === "api") {
      if (regionDyn.length > 0) {
        baseGroups.push({
          id: "api_region",
          label: "Region (tag)",
          pinned: false,
          values: regionDyn,
        })
      }
      return baseGroups
    }

    return [
      ...baseGroups,
      {
        id: "k8s.namespace",
        label: "Kubernetes namespace",
        values: [
          { value: "default", count: 14_212 },
          { value: "ingress-nginx", count: 8_103 },
          { value: "monitoring", count: 6_842 },
          { value: "kube-system", count: 4_512 },
          { value: "logify-prod", count: 3_120 },
        ],
      },
      {
        id: "k8s.workload",
        label: "Kubernetes workload",
        values: [
          { value: "Deployment", count: 31_004 },
          { value: "StatefulSet", count: 6_502 },
          { value: "DaemonSet", count: 1_823 },
          { value: "CronJob", count: 921 },
        ],
      },
      {
        id: "region",
        label: "Region",
        values: [
          { value: "us-east-1", count: 18_822 },
          { value: "eu-west-1", count: 9_104 },
          { value: "us-west-2", count: 4_512 },
          { value: "ap-south-1", count: 1_320 },
        ],
      },
    ]
  }, [facetLogs, dataSource])

  return (
    <Facets
      groups={groups}
      selection={selection}
      onSelectionChange={setSelection}
      title="Facets"
      className="flex-1 border-r-0"
    />
  )
}

function groupCount(items: string[]) {
  const counts = new Map<string, number>()
  for (const v of items) counts.set(v, (counts.get(v) ?? 0) + 1)
  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([value, count]) => ({ value, count }))
}
