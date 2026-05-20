"use client"

import {
  ActivityIcon,
  AlertTriangleIcon,
  ScrollTextIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  computeErrorRate,
  filterLogsByQuery,
} from "@/lib/dashboards/log-aggregations"
import type { StatMetricKind } from "@/lib/dashboards/types"
import type { LogEntry } from "@/lib/mock-data"

export function StatWidget({
  logs,
  kind = "error_rate",
  query,
}: {
  logs: LogEntry[]
  kind?: StatMetricKind
  query?: string
}) {
  const filtered = filterLogsByQuery(logs, query)

  if (kind === "ingest_volume") {
    const rate = (filtered.length / 1000).toFixed(1)
    return (
      <MetricDisplay
        icon={ScrollTextIcon}
        label="Events in range"
        value={rate}
        unit="k"
        hint={`${filtered.length.toLocaleString()} log lines`}
        tone="primary"
      />
    )
  }

  if (kind === "open_alerts") {
    const alerts = Math.max(
      1,
      Math.floor(
        filtered.filter((l) => l.level === "error" || l.level === "warn").length /
          40
      )
    )
    return (
      <MetricDisplay
        icon={AlertTriangleIcon}
        label="Open alerts"
        value={String(alerts)}
        hint="Derived from warn + error volume"
        tone="warn"
      />
    )
  }

  const { value, count } = computeErrorRate(filtered)
  return (
    <MetricDisplay
      icon={ActivityIcon}
      label="Error rate"
      value={value.toFixed(2)}
      unit="%"
      hint={`${count} errors in sample`}
      tone={value > 2 ? "danger" : "primary"}
    />
  )
}

function MetricDisplay({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  unit?: string
  hint: string
  tone: "primary" | "warn" | "danger"
}) {
  const toneClass = {
    primary: "text-primary",
    warn: "text-amber-600 dark:text-amber-400",
    danger: "text-destructive",
  }[tone]

  return (
    <div className="flex h-full flex-col justify-between p-1">
      <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn("text-[28px] font-semibold tabular-nums-lining", toneClass)}>
          {value}
        </span>
        {unit ? (
          <span className="text-[14px] font-medium text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}

