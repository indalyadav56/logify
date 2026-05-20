"use client"

import { cn } from "@/lib/utils"
import {
  filterLogsByQuery,
  topServices,
} from "@/lib/dashboards/log-aggregations"
import type { LogEntry } from "@/lib/mock-data"

export function TopServicesWidget({
  logs,
  query,
}: {
  logs: LogEntry[]
  query?: string
}) {
  const filtered = filterLogsByQuery(logs, query)
  const services = topServices(filtered, 8)
  const max = services[0]?.count ?? 1

  if (services.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
        No services in this time range
      </p>
    )
  }

  return (
    <ul className="flex h-full flex-col justify-center gap-2.5 overflow-y-auto py-1">
      {services.map((svc, i) => (
        <li key={svc.name}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="truncate text-[12px] font-medium text-foreground">
              {svc.name}
            </span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              {svc.count}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full bg-primary/80",
                i === 0 && "bg-primary"
              )}
              style={{ width: `${(svc.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
