"use client"

import * as React from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BadgeAlertIcon,
  InfoIcon,
  Loader2Icon,
  MoreVerticalIcon,
  CompassIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogLevelBadge } from "@/components/observability/log-level-badge"
import { LogMessageContent } from "@/components/observability/log-message"
import {
  getLogCellValue,
  isLogLevelColumn,
  type LogColumnDef,
} from "@/lib/log-columns"
import { LOG_LEVEL_ROW_BAR } from "@/lib/log-levels"
import type { LogEntry } from "@/lib/mock-data"

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

export type LogTableProps = {
  logs: LogEntry[]
  visibleColumns: LogColumnDef[]
  selectedId?: string
  onSelect: (log: LogEntry) => void
  wrap: boolean
  hasMoreOlder: boolean
  hasMoreNewer: boolean
  onLoadOlder: () => void
  onLoadNewer: () => void
  loading?: boolean
  contextLogId?: string
  onViewContext?: (log: LogEntry) => void
  className?: string
}

export function LogTable({
  logs,
  visibleColumns,
  selectedId,
  onSelect,
  wrap,
  hasMoreOlder,
  hasMoreNewer,
  onLoadOlder,
  onLoadNewer,
  loading = false,
  contextLogId,
  onViewContext,
  className,
}: LogTableProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const newestLog = logs[0]
  const oldestLog = logs[logs.length - 1]

  // Automatically scroll context target log into view if loaded
  React.useEffect(() => {
    if (contextLogId && !loading) {
      setTimeout(() => {
        const el = scrollRef.current?.querySelector(`[data-log-id="${contextLogId}"]`)
        if (el) {
          el.scrollIntoView({ block: "center", behavior: "smooth" })
        }
      }, 100)
    }
  }, [contextLogId, loading])

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col rounded-lg border border-border bg-background",
        className
      )}
    >
      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-auto"
      >
        <table className="w-full min-w-[720px] border-collapse text-[13px] font-sans">
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-border bg-background text-left text-[12px] font-medium text-muted-foreground">
              <th className="w-1.5 p-0" aria-hidden />
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    "border-r border-border/80 px-4 py-2.5 bg-background",
                    col.width,
                    col.minWidth,
                    col.id === "message" && "min-w-[320px]"
                  )}
                >
                  {col.id === "message" ? (
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      <InfoIcon className="size-3.5 opacity-60" aria-hidden />
                    </span>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              <th className="w-[72px] border-l border-border/80 px-2 py-2.5 bg-background text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className={cn(loading && "opacity-40 transition-opacity")}>
            {logs.map((log) => {
              const isTarget = log.id === contextLogId
              return (
                <LogTableRow
                  key={log.id}
                  log={log}
                  visibleColumns={visibleColumns}
                  active={selectedId === log.id || isTarget}
                  isContextTarget={isTarget}
                  wrap={wrap}
                  onSelect={onSelect}
                  onViewContext={onViewContext}
                />
              )
            })}
          </tbody>
        </table>

        {loading ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
            <Loader2Icon className="size-6 animate-spin text-primary" />
          </div>
        ) : null}

        {logs.length === 0 && !loading ? (
          <div className="flex flex-col items-center gap-1 border-t border-border p-12 text-center text-sm text-muted-foreground">
            <BadgeAlertIcon className="size-6 text-muted-foreground/80" />
            <p className="font-medium text-foreground">No logs available</p>
          </div>
        ) : null}
      </div>

      {/* Pagination Bar at bottom */}
      <div className="flex shrink-0 flex-col gap-3 border-t border-border/60 bg-muted/20 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[12px] text-muted-foreground">
          {newestLog && oldestLog ? (
            <span className="tabular-nums-lining">
              {contextLogId ? (
                <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                  <CompassIcon className="size-3.5 animate-pulse" />
                  Viewing surrounding log stream centered around highlighted anchor log
                </span>
              ) : (
                <>
                  Showing logs from{" "}
                  <strong className="font-semibold text-foreground/90">
                    {formatLogTimestamp(new Date(oldestLog.timestamp))}
                  </strong>{" "}
                  to{" "}
                  <strong className="font-semibold text-foreground/90">
                    {formatLogTimestamp(new Date(newestLog.timestamp))}
                  </strong>
                </>
              )}
            </span>
          ) : (
            <span>No logs currently shown</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="h-8 gap-1 px-2 text-[12px] font-medium"
            disabled={!hasMoreNewer || loading || contextLogId != null}
            onClick={onLoadNewer}
          >
            <ArrowLeftIcon className="size-3.5" />
            Newer logs
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="h-8 gap-1 px-2 text-[12px] font-medium"
            disabled={!hasMoreOlder || loading || contextLogId != null}
            onClick={onLoadOlder}
          >
            Older logs
            <ArrowRightIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function LogTableRow({
  log,
  visibleColumns,
  active,
  isContextTarget,
  wrap,
  onSelect,
  onViewContext,
}: {
  log: LogEntry
  visibleColumns: LogColumnDef[]
  active: boolean
  isContextTarget: boolean
  wrap: boolean
  onSelect: (log: LogEntry) => void
  onViewContext?: (log: LogEntry) => void
}) {
  const ts = new Date(log.timestamp)

  return (
    <tr
      data-log-id={log.id}
      onClick={() => onSelect(log)}
      className={cn(
        "group/row cursor-pointer border-b border-border/70 transition-all",
        !active && "bg-background hover:bg-muted/50",
        active && !isContextTarget && "relative z-[1] bg-primary/5 outline outline-1 outline-primary outline-offset-[-1px]",
        isContextTarget && "relative z-[1] bg-primary/10 hover:bg-primary/15 border-y-primary/30 outline outline-1 outline-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.15)]"
      )}
    >
      <td
        className={cn(
          "w-1.5 p-0 relative transition-all", 
          LOG_LEVEL_ROW_BAR[log.level],
          isContextTarget && "w-3.5 after:absolute after:inset-y-0 after:left-0 after:w-1.5 after:bg-primary after:animate-pulse"
        )}
        aria-hidden
      />
      {visibleColumns.map((col) => {
        const isMsg = col.id === "message"
        return (
          <LogTableCell
            key={col.id}
            column={col}
            log={log}
            ts={ts}
            wrap={wrap}
            isContextTarget={isContextTarget && isMsg}
          />
        )
      })}
      <td className="w-[72px] border-l border-border/50 px-2 py-2.5 align-top bg-transparent">
        <div className="flex justify-center bg-transparent">
          <RowActions log={log} active={active || isContextTarget} onViewContext={onViewContext} />
        </div>
      </td>
    </tr>
  )
}

function LogTableCell({
  column,
  log,
  ts,
  wrap,
  isContextTarget,
}: {
  column: LogColumnDef
  log: LogEntry
  ts: Date
  wrap: boolean
  isContextTarget?: boolean
}) {
  const base =
    "border-r border-border/50 px-4 py-2.5 align-top"

  if (column.id === "timestamp") {
    return (
      <td
        className={cn(
          base,
          "tabular-nums-lining whitespace-nowrap text-[13px] text-foreground",
          column.width,
          column.minWidth
        )}
      >
        {(() => {
          const formatted = formatLogTimestamp(ts)
          const parts = formatted.split(".")
          if (parts.length === 2) {
            return (
              <>
                {parts[0]}
                <span className="text-[12px] text-muted-foreground/70">
                  .{parts[1]}
                </span>
              </>
            )
          }
          return formatted
        })()}
      </td>
    )
  }

  if (isLogLevelColumn(column.id)) {
    return (
      <td className={cn(base, "whitespace-nowrap", column.width, column.minWidth)}>
        <LogLevelBadge level={log.level} />
      </td>
    )
  }

  if (column.id === "message") {
    return (
      <td className={cn(base, column.minWidth)}>
        <div className="flex items-start gap-2.5">
          {isContextTarget ? (
            <span className="inline-flex shrink-0 items-center rounded-sm bg-primary px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-primary-foreground">
              Anchor Log
            </span>
          ) : null}
          <LogMessageContent message={log.message} wrap={wrap} />
        </div>
      </td>
    )
  }

  const raw = getLogCellValue(log, column.id)
  const isIdField = column.id === "traceId" || column.id === "spanId"
  const isAttribute = column.group === "attribute"

  return (
    <td
      className={cn(
        base,
        column.width,
        column.minWidth,
        isIdField || isAttribute
          ? "font-code max-w-[200px] truncate text-[12px] text-foreground/90"
          : "truncate text-[13px] text-foreground/90"
      )}
      title={raw || undefined}
    >
      {raw || <span className="text-muted-foreground/50">—</span>}
    </td>
  )
}

function RowActions({
  log,
  active,
  onViewContext,
}: {
  log: LogEntry
  active: boolean
  onViewContext?: (log: LogEntry) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className={cn(
            "size-7 text-muted-foreground data-[state=open]:opacity-100 bg-transparent",
            active
              ? "opacity-100"
              : "opacity-0 group-hover/row:opacity-100"
          )}
          aria-label="Row actions"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            void navigator.clipboard.writeText(log.message)
          }}
        >
          Copy message
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            void navigator.clipboard.writeText(log.traceId)
          }}
        >
          Copy trace ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onViewContext?.(log)
          }}
        >
          View in context
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Dynatrace-style: `Jan 8, 11:10:35.378` */
export function formatLogTimestamp(d: Date) {
  const month = MONTHS[d.getMonth()]
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  const s = String(d.getSeconds()).padStart(2, "0")
  const ms = String(d.getMilliseconds()).padStart(3, "0")
  return `${month} ${day}, ${h}:${m}:${s}.${ms}`
}
