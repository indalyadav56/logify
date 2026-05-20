"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LOG_LEVEL_CHART } from "@/lib/log-levels"
import type { LogLevel } from "@/lib/mock-data"

const TIMESERIES_LEGEND = [
  { label: "INFO", key: "info" as const, color: LOG_LEVEL_CHART.info },
  { label: "WARN", key: "warn" as const, color: LOG_LEVEL_CHART.warn },
  { label: "ERROR", key: "error" as const, color: LOG_LEVEL_CHART.error },
  { label: "NONE", key: "none" as const, color: "oklch(0.45 0.02 252)" },
] as const

export type TimeseriesBucket = {
  bucket: string
  bucketStart?: number
  bucketEnd?: number
  info: number
  warn: number
  error: number
  none: number
}

export type TimeseriesChartProps = {
  data: TimeseriesBucket[]
  totals: Record<LogLevel, number>
  rangeLabel: string
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onBucketClick?: (start: number, end: number) => void
}

export function TimeseriesChart({
  data,
  totals,
  rangeLabel,
  collapsed,
  onCollapsedChange,
  onBucketClick,
}: TimeseriesChartProps) {
  const noneTotal =
    (totals.trace ?? 0) + (totals.debug ?? 0) + (totals.fatal ?? 0)

  return (
    <div className="shrink-0 border-b border-border/60 bg-muted/10 px-4 py-3">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div
          className={cn(
            "flex min-h-11 items-center justify-between gap-3 px-4 py-2.5",
            !collapsed && "border-b border-border/50"
          )}
        >
          <span className="truncate text-[13px] font-semibold tracking-tight text-foreground">
            Timeseries
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-md px-2.5 text-[12px] text-muted-foreground transition-colors duration-150 hover:bg-muted/80 hover:text-foreground"
            onClick={() => onCollapsedChange(!collapsed)}
          >
            {collapsed ? (
              <>
                <EyeIcon className="size-3.5" />
                Show chart
              </>
            ) : (
              <>
                <EyeOffIcon className="size-3.5" />
                Hide chart
              </>
            )}
          </Button>
        </div>

        {!collapsed ? (
          <div className="flex min-h-[9.5rem] bg-background/40">
            <div className={cn("min-w-0 flex-1 px-3 py-3", onBucketClick && "cursor-pointer")}>
              <ResponsiveContainer width="100%" height={152}>
                <BarChart
                  data={data}
                  margin={{ top: 6, right: 8, bottom: 4, left: 4 }}
                  onClick={(state: any) => {
                    if (
                      state &&
                      state.activePayload &&
                      state.activePayload.length > 0 &&
                      onBucketClick
                    ) {
                      const clicked = state.activePayload[0].payload as TimeseriesBucket
                      if (
                        typeof clicked.bucketStart === "number" &&
                        typeof clicked.bucketEnd === "number"
                      ) {
                        onBucketClick(clicked.bucketStart, clicked.bucketEnd)
                      }
                    }
                  }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="color-mix(in oklab, var(--foreground) 7%, transparent)"
                    strokeDasharray="2 4"
                  />
                  <XAxis
                    dataKey="bucket"
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    tickMargin={6}
                    minTickGap={32}
                    stroke="color-mix(in oklab, var(--foreground) 45%, transparent)"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={36}
                    fontSize={10}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)
                    }
                    stroke="color-mix(in oklab, var(--foreground) 45%, transparent)"
                  />
                  <RechartsTooltip
                    cursor={{
                      fill: "color-mix(in oklab, var(--foreground) 5%, transparent)",
                    }}
                    contentStyle={{
                      borderRadius: "var(--radius-md)",
                      fontSize: 11,
                      padding: "8px 10px",
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      fontFamily:
                        "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
                    }}
                  />
                  {TIMESERIES_LEGEND.map((l, i) => (
                    <Bar
                      key={l.key}
                      dataKey={l.key}
                      stackId="x"
                      fill={l.color}
                      radius={
                        i === TIMESERIES_LEGEND.length - 1 ? [3, 3, 0, 0] : 0
                      }
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <aside className="flex w-28 shrink-0 flex-col justify-center gap-3 border-l border-border/50 py-3 pr-3 pl-2">
              {TIMESERIES_LEGEND.map((l) => {
                const count =
                  l.key === "none"
                    ? noneTotal
                    : (totals[l.key as LogLevel] ?? 0)
                return (
                  <span
                    key={l.label}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: l.color }}
                    />
                    <span className="font-medium">{l.label}</span>
                    <span className="tabular-nums-lining ml-auto font-semibold text-foreground">
                      {count.toLocaleString()}
                    </span>
                  </span>
                )
              })}
              <span className="sr-only">{rangeLabel}</span>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  )
}
