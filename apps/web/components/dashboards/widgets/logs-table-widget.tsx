"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { LogLevelBadge } from "@/components/observability/log-level-badge"
import { filterLogsByQuery } from "@/lib/dashboards/log-aggregations"
import { LOG_LEVEL_ROW_BAR } from "@/lib/log-levels"
import type { LogEntry } from "@/lib/mock-data"

function formatTs(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export function LogsTableWidget({
  logs,
  query,
  limit = 12,
}: {
  logs: LogEntry[]
  query?: string
  limit?: number
}) {
  const filtered = filterLogsByQuery(logs, query).slice(0, limit)

  if (filtered.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
        No logs match this widget query
      </p>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border/60">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <tr className="border-b border-border">
              <th className="px-2 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Time
              </th>
              <th className="px-2 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Level
              </th>
              <th className="px-2 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Service
              </th>
              <th className="px-2 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Message
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr
                key={log.id}
                className="group border-b border-border/40 hover:bg-muted/30"
              >
                <td className="relative whitespace-nowrap px-2 py-1.5 font-mono text-[11px] text-muted-foreground">
                  <span
                    className={cn(
                      "absolute top-0 left-0 h-full w-0.5",
                      LOG_LEVEL_ROW_BAR[log.level]
                    )}
                  />
                  {formatTs(log.timestamp)}
                </td>
                <td className="px-2 py-1.5">
                  <LogLevelBadge level={log.level} />
                </td>
                <td className="max-w-[100px] truncate px-2 py-1.5 text-[11px] text-foreground">
                  {log.service}
                </td>
                <td className="max-w-0 truncate px-2 py-1.5 text-[11px] text-foreground/90">
                  {log.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-right text-[11px] text-muted-foreground">
        <Link href="/dashboard/logs" className="font-medium text-primary hover:underline">
          Open in Logs →
        </Link>
      </p>
    </div>
  )
}
