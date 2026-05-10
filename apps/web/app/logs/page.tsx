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
import {
  ArrowUpRightIcon,
  AtomIcon,
  BadgeAlertIcon,
  ChevronDownIcon,
  ColumnsIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  HelpCircleIcon,
  PinIcon,
  RefreshCwIcon,
  SaveIcon,
  Settings2Icon,
  SparklesIcon,
  WrapTextIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { QueryBar } from "@/components/observability/query-bar"
import { LogDetail } from "@/components/observability/log-detail"
import {
  type LogEntry,
  type LogLevel,
  logs as ALL_LOGS,
} from "@/lib/mock-data"
import { useLogsStore } from "@/lib/logs-store"

const LEVEL_COLOR: Record<LogLevel, string> = {
  trace: "#71717a",
  debug: "#0ea5e9",
  info: "#10b981",
  warn: "#f59e0b",
  error: "#ef4444",
  fatal: "#d946ef",
}

const LEVEL_BAR: Record<LogLevel, string> = {
  trace: "bg-zinc-500",
  debug: "bg-sky-500",
  info: "bg-emerald-500",
  warn: "bg-amber-500",
  error: "bg-rose-500",
  fatal: "bg-fuchsia-500",
}

const LEVEL_PILL: Record<LogLevel, string> = {
  trace:
    "border-zinc-500/40 bg-zinc-500/15 text-zinc-700 dark:text-zinc-200",
  debug: "border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-200",
  info: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
  warn: "border-amber-500/45 bg-amber-500/20 text-amber-800 dark:text-amber-200",
  error:
    "border-rose-500/45 bg-rose-500/20 text-rose-700 dark:text-rose-200",
  fatal:
    "border-fuchsia-500/45 bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-200",
}

const LEVELS: LogLevel[] = ["trace", "debug", "info", "warn", "error", "fatal"]

export default function LogsPage() {
  const {
    query,
    setQuery,
    selection,
    range,
    setRange,
    paused,
    setPaused,
  } = useLogsStore()

  const [selected, setSelected] = React.useState<LogEntry | null>(null)
  const [chartHidden, setChartHidden] = React.useState(false)
  const [wrap, setWrap] = React.useState(false)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return ALL_LOGS.filter((log) => {
      if (q) {
        const matches =
          log.message.toLowerCase().includes(q) ||
          log.service.toLowerCase().includes(q) ||
          log.host.toLowerCase().includes(q)
        if (!matches) return false
      }
      const sel = selection
      if (sel.level && sel.level.size > 0 && !sel.level.has(log.level))
        return false
      if (sel.service && sel.service.size > 0 && !sel.service.has(log.service))
        return false
      if (sel.host && sel.host.size > 0 && !sel.host.has(log.host)) return false
      if (
        sel.environment &&
        sel.environment.size > 0 &&
        !sel.environment.has(log.environment)
      )
        return false
      return true
    })
  }, [query, selection])

  const histogram = React.useMemo(() => buildHistogram(filtered), [filtered])

  const totalRecords = React.useMemo(
    () =>
      filtered.reduce(
        (acc, l) => {
          acc[l.level] = (acc[l.level] ?? 0) + 1
          return acc
        },
        {} as Record<LogLevel, number>
      ),
    [filtered]
  )

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        className={cn(
          "grid min-h-0 min-w-0 flex-1 overflow-hidden",
          selected ? "grid-cols-1 xl:grid-cols-[1fr_440px]" : "grid-cols-1"
        )}
      >
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="relative z-30 border-b border-border/60 bg-background px-3 py-2">
            <QueryBar
              className="w-full"
              value={query}
              onChange={setQuery}
              range={range}
              onRangeChange={setRange}
              paused={paused}
              onPauseChange={setPaused}
            />
          </div>

          {!chartHidden ? (
            <VolumeChart data={histogram} totals={totalRecords} />
          ) : null}

          <ResultsHeader
            count={filtered.length}
            wrap={wrap}
            setWrap={setWrap}
            chartHidden={chartHidden}
            onToggleChart={() => setChartHidden((c) => !c)}
          />

          {/* <WatchdogBanner /> */}

          <div className="min-h-0 flex-1 overflow-hidden">
            <LogTable
              logs={filtered}
              selectedId={selected?.id}
              onSelect={setSelected}
              wrap={wrap}
            />
          </div>
        </section>

        {selected ? (
          <aside className="hidden border-l xl:block">
            <LogDetail entry={selected} onClose={() => setSelected(null)} />
          </aside>
        ) : null}
      </div>
    </div>
  )
}

function ResultsHeader({
  count,
  wrap,
  setWrap,
  chartHidden,
  onToggleChart,
}: {
  count: number
  wrap: boolean
  setWrap: (v: boolean) => void
  chartHidden: boolean
  onToggleChart: () => void
}) {
  return (
    <div className="flex h-9 items-center gap-2 border-b border-border/60 bg-muted/20 px-3">
      <span className="font-mono text-[12.5px] tabular-nums">
        <strong className="font-semibold text-foreground">
          {count.toLocaleString()}
        </strong>
        <span className="text-muted-foreground">
          {" "}
          of 72,318 records
        </span>
      </span>
      <Badge
        variant="outline"
        className="h-5 gap-1 border-border/60 px-1.5 font-mono text-[11px] text-muted-foreground"
      >
        sampled 100%
      </Badge>
      <span className="text-[11.5px] text-muted-foreground">
        Last refreshed just now
      </span>

      <div className="ml-auto flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="xs"
          className="h-7 gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
          onClick={onToggleChart}
        >
          {chartHidden ? (
            <>
              <EyeIcon /> Show chart
            </>
          ) : (
            <>
              <EyeOffIcon /> Hide chart
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="h-7 gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
          onClick={() => setWrap(!wrap)}
        >
          <WrapTextIcon /> {wrap ? "No wrap" : "Wrap lines"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              className="h-7 gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
            >
              <ColumnsIcon /> Columns
              <ChevronDownIcon className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuItem>Timestamp ✓</DropdownMenuItem>
            <DropdownMenuItem>Status ✓</DropdownMenuItem>
            <DropdownMenuItem>Service ✓</DropdownMenuItem>
            <DropdownMenuItem>Host</DropdownMenuItem>
            <DropdownMenuItem>Trace</DropdownMenuItem>
            <DropdownMenuItem>Region</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Reset</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="xs"
          className="h-7 gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
        >
          <SaveIcon /> Save view
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="h-7 gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
        >
          <DownloadIcon /> Export
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Refresh"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <RefreshCwIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <Settings2Icon />
        </Button>
      </div>
    </div>
  )
}

function WatchdogBanner() {
  return (
    <div className="flex h-9 items-center gap-2 border-b border-border/60 bg-violet-500/[0.06] px-3 text-[12.5px]">
      <span className="flex size-5 items-center justify-center rounded bg-violet-500/20">
        <SparklesIcon className="size-3 text-violet-600 dark:text-violet-300" />
      </span>
      <span className="text-foreground/90">
        <strong className="font-semibold text-foreground">Watchdog</strong>{" "}
        detected an{" "}
        <span className="font-semibold text-rose-600 dark:text-rose-400">
          error spike
        </span>{" "}
        on{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11.5px] font-medium text-foreground">
          payments-service
        </code>{" "}
        — 4.2× baseline in last 5m
      </span>
      <Button
        variant="ghost"
        size="xs"
        className="ml-auto h-7 gap-1 text-[12px] text-violet-700 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200"
      >
        Investigate <ArrowUpRightIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
      >
        <HelpCircleIcon />
      </Button>
    </div>
  )
}

function LogTable({
  logs,
  selectedId,
  onSelect,
  wrap,
}: {
  logs: LogEntry[]
  selectedId?: string
  onSelect: (l: LogEntry) => void
  wrap: boolean
}) {
  return (
    <div className="h-full w-full overflow-auto font-mono text-[12.5px] leading-snug">
      <table
        className={cn(
          "border-separate border-spacing-0",
          wrap ? "w-full min-w-[1100px]" : "w-max min-w-full"
        )}
      >
        <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur">
          <tr className="text-[10.5px] tracking-[0.06em] text-muted-foreground uppercase">
            <th className="sticky left-0 z-10 w-1.5 border-b border-border/60 bg-background/95 backdrop-blur" />
            <th className="border-b border-border/60 px-2.5 py-2 text-left font-semibold whitespace-nowrap">
              Timestamp
            </th>
            <th className="border-b border-border/60 px-2.5 py-2 text-left font-semibold whitespace-nowrap">
              Status
            </th>
            <th className="border-b border-border/60 px-2.5 py-2 text-left font-semibold whitespace-nowrap">
              Service
            </th>
            <th className="border-b border-border/60 px-2.5 py-2 text-left font-semibold whitespace-nowrap">
              Host
            </th>
            <th className="w-full border-b border-border/60 px-2.5 py-2 text-left font-semibold whitespace-nowrap">
              Message
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.slice(0, 350).map((log) => {
            const ts = new Date(log.timestamp)
            const active = selectedId === log.id
            return (
              <tr
                key={log.id}
                onClick={() => onSelect(log)}
                className={cn(
                  "group/row cursor-pointer transition-colors",
                  active ? "bg-primary/5" : "hover:bg-muted/40"
                )}
              >
                <td
                  className={cn(
                    "sticky left-0 z-[1] w-1.5 border-b border-border/40 align-top",
                    LEVEL_BAR[log.level],
                    active
                      ? "bg-primary/5"
                      : "bg-background group-hover/row:bg-muted/40"
                  )}
                />
                <td className="border-b border-border/40 px-2.5 py-1.5 align-top whitespace-nowrap text-foreground/80 tabular-nums">
                  {formatHms(ts)}
                  <span className="ml-0.5 text-[11px] text-muted-foreground">
                    .{String(ts.getUTCMilliseconds()).padStart(3, "0")}
                  </span>
                </td>
                <td className="border-b border-border/40 px-2.5 py-1.5 align-top whitespace-nowrap">
                  <span className={cn("pill-status", LEVEL_PILL[log.level])}>
                    {log.level}
                  </span>
                </td>
                <td className="border-b border-border/40 px-2.5 py-1.5 align-top whitespace-nowrap font-medium text-foreground">
                  {log.service}
                </td>
                <td className="border-b border-border/40 px-2.5 py-1.5 align-top whitespace-nowrap text-muted-foreground">
                  {log.host}
                </td>
                <td
                  className={cn(
                    "border-b border-border/40 px-2.5 py-1.5 align-top text-foreground/90",
                    wrap
                      ? "break-words whitespace-pre-wrap"
                      : "whitespace-nowrap"
                  )}
                >
                  {log.message}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center gap-1 p-12 text-center text-sm text-muted-foreground">
          <BadgeAlertIcon className="size-6" />
          <p className="font-medium text-foreground">
            No logs match your query
          </p>
          <p className="text-xs">
            Try widening the time range or removing some filters.
          </p>
        </div>
      ) : null}
    </div>
  )
}

function VolumeChart({
  data,
  totals,
}: {
  data: ReturnType<typeof buildHistogram>
  totals: Record<LogLevel, number>
}) {
  return (
    <div className="border-b border-border/60 bg-background">
      <div className="flex h-9 items-center gap-3 px-3">
        <span className="flex items-center gap-1.5">
          <AtomIcon className="size-3.5 text-muted-foreground" />
          <span className="text-[12.5px] font-semibold tracking-tight">
            Timeseries
          </span>
          <span className="text-[11.5px] text-muted-foreground">
            · Last 30 minutes
          </span>
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-3">
          {LEVELS.map((l) => (
            <span
              key={l}
              className="inline-flex items-center gap-1.5 font-mono text-[11px]"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: LEVEL_COLOR[l] }}
              />
              <span className="font-medium text-muted-foreground uppercase">
                {l}
              </span>
              <span className="font-semibold text-foreground tabular-nums">
                {totals[l]?.toLocaleString() ?? 0}
              </span>
            </span>
          ))}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          aria-label="Pin"
        >
          <PinIcon />
        </Button>
      </div>
      <div className="h-32 px-2 pt-1 pb-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="color-mix(in oklab, var(--foreground) 8%, transparent)"
              strokeDasharray="2 4"
            />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tickMargin={6}
              minTickGap={32}
              stroke="color-mix(in oklab, var(--foreground) 55%, transparent)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={32}
              fontSize={10}
              stroke="color-mix(in oklab, var(--foreground) 55%, transparent)"
            />
            <RechartsTooltip
              cursor={{
                fill: "color-mix(in oklab, var(--foreground) 6%, transparent)",
              }}
              contentStyle={{
                borderRadius: 6,
                fontSize: 11,
                padding: "6px 8px",
                background: "var(--popover)",
                border: "1px solid var(--border)",
              }}
            />
            {LEVELS.map((l, i) => (
              <Bar
                key={l}
                dataKey={l}
                stackId="x"
                fill={LEVEL_COLOR[l]}
                radius={i === LEVELS.length - 1 ? [2, 2, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function formatHms(d: Date) {
  return [
    String(d.getUTCHours()).padStart(2, "0"),
    String(d.getUTCMinutes()).padStart(2, "0"),
    String(d.getUTCSeconds()).padStart(2, "0"),
  ].join(":")
}

function formatHm(d: Date) {
  return [
    String(d.getUTCHours()).padStart(2, "0"),
    String(d.getUTCMinutes()).padStart(2, "0"),
  ].join(":")
}

function buildHistogram(items: LogEntry[]) {
  const buckets = 30
  const latest = items.length
    ? items.reduce(
        (m, e) => Math.max(m, new Date(e.timestamp).getTime()),
        0
      )
    : 0
  const earliest = items.length
    ? items.reduce(
        (m, e) => Math.min(m, new Date(e.timestamp).getTime()),
        latest
      )
    : 0
  const span = Math.max(60_000, latest - earliest)
  const step = span / buckets

  const out = Array.from({ length: buckets }, (_, i) => {
    const bucketStart = earliest + step * i
    return {
      bucket: formatHm(new Date(bucketStart)),
      trace: 0,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
    }
  })

  for (const item of items) {
    const t = new Date(item.timestamp).getTime()
    const idx = Math.min(
      buckets - 1,
      Math.max(0, Math.floor((t - earliest) / step))
    )
    ;(out[idx] as Record<string, number | string>)[item.level] =
      ((out[idx] as Record<string, number | string>)[item.level] as number) + 1
  }

  return out
}
