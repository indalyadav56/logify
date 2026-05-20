"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { LOG_LEVEL_CHART } from "@/lib/log-levels"
import {
  buildVolumeBuckets,
  filterLogsByQuery,
  levelTotals,
} from "@/lib/dashboards/log-aggregations"
import type { LogEntry } from "@/lib/mock-data"

export function LogVolumeWidget({
  logs,
  query,
}: {
  logs: LogEntry[]
  query?: string
}) {
  const filtered = filterLogsByQuery(logs, query)
  const data = buildVolumeBuckets(filtered, 20)
  const totals = levelTotals(filtered)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2 flex flex-wrap gap-3 px-1">
        {(
          [
            ["INFO", totals.info + totals.debug + totals.trace, LOG_LEVEL_CHART.info],
            ["WARN", totals.warn, LOG_LEVEL_CHART.warn],
            ["ERROR", totals.error + totals.fatal, LOG_LEVEL_CHART.error],
          ] as const
        ).map(([label, count, color]) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
          >
            <span
              className="size-2 rounded-sm"
              style={{ backgroundColor: color }}
            />
            {label}{" "}
            <span className="font-mono text-foreground">{count}</span>
          </span>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="oklch(0.5 0.02 252 / 0.12)"
            />
            <XAxis
              dataKey="bucket"
              tick={{ fontSize: 10, fill: "oklch(0.55 0.03 252)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "oklch(0.55 0.03 252)" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: "1px solid oklch(0.88 0.015 250)",
              }}
            />
            <Bar dataKey="info" stackId="a" fill={LOG_LEVEL_CHART.info} />
            <Bar dataKey="warn" stackId="a" fill={LOG_LEVEL_CHART.warn} />
            <Bar dataKey="error" stackId="a" fill={LOG_LEVEL_CHART.error} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
