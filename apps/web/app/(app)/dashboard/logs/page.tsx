"use client"

import * as React from "react"
import { DownloadIcon, WrapTextIcon, CompassIcon, ArrowLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { QueryBar } from "@/components/observability/query-bar"
import { LogDetail } from "@/components/observability/log-detail"
import { LogColumnsPicker } from "@/components/observability/log-columns-picker"
import { LogTable } from "@/components/observability/log-table"
import { TimeseriesChart } from "@/components/observability/timeseries-chart"
import {
  DEFAULT_VISIBLE_COLUMN_IDS,
  discoverLogColumns,
  mergeColumnOrder,
  orderVisibleColumns,
  type LogColumnDef,
} from "@/lib/log-columns"
import {
  type LogEntry,
  type LogLevel,
} from "@/lib/mock-data"
import { useLogsStore } from "@/lib/logs-store"
import { useLogsData } from "@/lib/logs-data-context"

const RANGE_LABELS: Record<string, string> = {
  "5m": "Last 5 minutes",
  "15m": "Last 15 minutes",
  "30m": "Last 30 minutes",
  "1h": "Last 1 hour",
  "6h": "Last 6 hours",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
}

export default function LogsPage() {
  const {
    query,
    setQuery,
    range,
    setRange,
    selection,
    appliedQuery,
    appliedSelection,
    applyFilters,
  } = useLogsStore()

  const {
    logs: sourceLogs,
    totalHits,
    hasMoreOlder,
    hasMoreNewer,
    loading: logsLoading,
    chartLogs,
    refetch,
    loadOlder,
    loadNewer,
    contextLog,
    setContextLog,
  } = useLogsData()

  const [selected, setSelected] = React.useState<LogEntry | null>(null)
  const [chartHidden, setChartHidden] = React.useState(false)
  const [wrap, setWrap] = React.useState(true)
  const [zoomRange, setZoomRange] = React.useState<{ start: number; end: number } | null>(null)
  const [visibleColumnIds, setVisibleColumnIds] = React.useState<string[]>(
    DEFAULT_VISIBLE_COLUMN_IDS
  )
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    DEFAULT_VISIBLE_COLUMN_IDS
  )

  const allColumns = React.useMemo(
    () => discoverLogColumns(sourceLogs),
    [sourceLogs]
  )

  const visibleColumns = React.useMemo(
    () => orderVisibleColumns(allColumns, visibleColumnIds),
    [allColumns, visibleColumnIds]
  )

  React.useEffect(() => {
    setColumnOrder((prev) => mergeColumnOrder(prev, allColumns))
    setVisibleColumnIds((prev) => {
      const valid = new Set(allColumns.map((c) => c.id))
      const next = prev.filter((id) => valid.has(id))
      return next.length > 0 ? next : DEFAULT_VISIBLE_COLUMN_IDS
    })
  }, [allColumns])

  const filtered = React.useMemo(() => {
    // Zoom range takes priority if active, otherwise use all sourceLogs
    let result = sourceLogs
    if (zoomRange) {
      result = result.filter((l) => {
        const t = new Date(l.timestamp).getTime()
        return t >= zoomRange.start && t < zoomRange.end
      })
    }
    return result
  }, [sourceLogs, zoomRange])

  const handleRun = React.useCallback(() => {
    setZoomRange(null)
    applyFilters()
    void refetch({ range, query, selection })
  }, [applyFilters, query, refetch, range, selection])

  const histogram = React.useMemo(
    () => buildHistogram(chartLogs),
    [chartLogs]
  )

  React.useEffect(() => {
    setSelected((prev) => {
      if (!prev) return null
      return sourceLogs.some((l) => l.id === prev.id) ? prev : null
    })
  }, [sourceLogs])

  const totalRecords = React.useMemo(
    () =>
      chartLogs.reduce(
        (acc, l) => {
          acc[l.level] = (acc[l.level] ?? 0) + 1
          return acc
        },
        {} as Record<LogLevel, number>
      ),
    [chartLogs]
  )

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        className={cn(
          "grid min-h-0 min-w-0 flex-1 overflow-hidden",
          selected ? "grid-cols-1 xl:grid-cols-[1fr_440px]" : "grid-cols-1"
        )}
      >
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden font-sans">
          {contextLog ? (
            <div className="relative z-30 flex items-center justify-between gap-4 border-b border-border/60 bg-primary/5 px-4 py-3 backdrop-blur-[2px]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <CompassIcon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold tracking-tight text-foreground flex items-center gap-1.5">
                    Viewing Context: ±50 Logs around anchor
                    <span className="font-mono text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {contextLog.id}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Active filters temporarily suspended. Origin service: <strong className="font-medium text-foreground/85">{contextLog.service}</strong> at <strong className="font-medium text-foreground/85">{new Date(contextLog.timestamp).toLocaleTimeString()}</strong>
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-[12px] shrink-0 font-medium"
                onClick={() => setContextLog(null)}
              >
                <ArrowLeftIcon className="size-3.5" />
                Exit Context
              </Button>
            </div>
          ) : (
            <div className="relative z-30 flex items-start gap-3 border-b border-border/60 bg-muted/15 px-4 py-3 backdrop-blur-[2px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger
                    className="size-8 shrink-0"
                    aria-label="Toggle facets"
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">Toggle facets</TooltipContent>
              </Tooltip>
              <QueryBar
                className="min-w-0 flex-1"
                value={query}
                onChange={setQuery}
                range={range}
                onRangeChange={setRange}
                onRun={handleRun}
              />
            </div>
          )}

          <TimeseriesChart
            data={histogram}
            totals={totalRecords}
            rangeLabel={RANGE_LABELS[range] ?? range}
            collapsed={chartHidden}
            onCollapsedChange={setChartHidden}
            onBucketClick={(start, end) => setZoomRange({ start, end })}
          />

          <ResultsHeader
            loadedCount={filtered.length}
            totalHits={zoomRange ? filtered.length : totalHits}
            hasMoreOlder={zoomRange ? false : hasMoreOlder}
            hasMoreNewer={zoomRange ? false : hasMoreNewer}
            loading={logsLoading}
            wrap={wrap}
            setWrap={setWrap}
            columns={allColumns}
            visibleColumnIds={visibleColumnIds}
            columnOrder={columnOrder}
            onVisibleColumnIdsChange={setVisibleColumnIds}
            onColumnOrderChange={setColumnOrder}
          />

          {zoomRange ? (
            <div className="mx-3 mt-2 flex items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-[12.5px] text-primary">
              <span className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
                </span>
                <span>
                  Filtered to timeseries slice:{" "}
                  <strong className="font-semibold">
                    {new Date(zoomRange.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>{" "}
                  to{" "}
                  <strong className="font-semibold">
                    {new Date(zoomRange.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </span>
              </span>
              <Button
                variant="ghost"
                size="xs"
                className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => setZoomRange(null)}
              >
                Clear slice
              </Button>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-hidden p-3 pt-2">
            <LogTable
              logs={filtered}
              visibleColumns={visibleColumns}
              selectedId={selected?.id}
              onSelect={setSelected}
              wrap={wrap}
              hasMoreOlder={zoomRange ? false : hasMoreOlder}
              hasMoreNewer={zoomRange ? false : hasMoreNewer}
              onLoadOlder={() => void loadOlder()}
              onLoadNewer={() => void loadNewer()}
              loading={logsLoading}
              contextLogId={contextLog?.id}
              onViewContext={setContextLog}
            />
          </div>
        </section>

        {selected ? (
          <aside className="hidden animate-in fade-in-0 slide-in-from-right-2 border-l border-border/60 duration-200 xl:block">
            <LogDetail entry={selected} onClose={() => setSelected(null)} />
          </aside>
        ) : null}
      </div>
    </div>
  )
}

function ResultsHeader({
  loadedCount,
  totalHits,
  hasMoreOlder,
  hasMoreNewer,
  loading,
  wrap,
  setWrap,
  columns,
  visibleColumnIds,
  columnOrder,
  onVisibleColumnIdsChange,
  onColumnOrderChange,
}: {
  loadedCount: number
  totalHits: number
  hasMoreOlder: boolean
  hasMoreNewer: boolean
  loading: boolean
  wrap: boolean
  setWrap: (v: boolean) => void
  columns: LogColumnDef[]
  visibleColumnIds: string[]
  columnOrder: string[]
  onVisibleColumnIdsChange: (ids: string[]) => void
  onColumnOrderChange: (order: string[]) => void
}) {
  const isPaged = hasMoreOlder || hasMoreNewer
  return (
    <div className="flex min-h-12 items-center gap-4 border-b border-border/60 bg-muted/20 px-4 py-2">
      <span className="tabular-nums-lining text-[13px]">
        <strong className="font-semibold text-foreground">
          {loading
            ? "…"
            : isPaged
              ? `Showing ${loadedCount.toLocaleString()} of ${totalHits.toLocaleString()}`
              : loadedCount.toLocaleString()}
        </strong>
        <span className="text-muted-foreground">
          {loading ? "" : " logs"}
        </span>
      </span>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="xs"
          className="h-8 gap-1.5 rounded-md px-2.5 text-[12px] text-muted-foreground transition-colors duration-150 hover:bg-muted/80 hover:text-foreground"
          onClick={() => setWrap(!wrap)}
        >
          <WrapTextIcon /> {wrap ? "No wrap" : "Wrap lines"}
        </Button>
        <LogColumnsPicker
          columns={columns}
          visibleIds={visibleColumnIds}
          columnOrder={columnOrder}
          onVisibleChange={onVisibleColumnIdsChange}
          onColumnOrderChange={onColumnOrderChange}
        />
        <Button
          variant="ghost"
          size="xs"
          className="h-8 gap-1.5 rounded-md px-2.5 text-[12px] text-muted-foreground transition-colors duration-150 hover:bg-muted/80 hover:text-foreground"
        >
          <DownloadIcon /> Export
        </Button>
      </div>
    </div>
  )
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
      info: 0,
      warn: 0,
      error: 0,
      none: 0,
    }
  })

  for (const item of items) {
    const t = new Date(item.timestamp).getTime()
    const idx = Math.min(
      buckets - 1,
      Math.max(0, Math.floor((t - earliest) / step))
    )
    if (item.level === "info" || item.level === "warn" || item.level === "error") {
        (out[idx] as Record<string, number | string>)[item.level] =
        ((out[idx] as Record<string, number | string>)[item.level] as number) + 1
    } else {
        (out[idx] as Record<string, number | string>)["none"] =
        ((out[idx] as Record<string, number | string>)["none"] as number) + 1
    }
  }

  return out
}
