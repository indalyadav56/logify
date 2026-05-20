"use client"

import * as React from "react"
import { LayoutGridIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardWidgetFrame } from "@/components/dashboards/dashboard-widget-frame"
import { LogVolumeWidget } from "@/components/dashboards/widgets/log-volume-widget"
import { LogsTableWidget } from "@/components/dashboards/widgets/logs-table-widget"
import { NoteWidget } from "@/components/dashboards/widgets/note-widget"
import { StatWidget } from "@/components/dashboards/widgets/stat-widget"
import { TopServicesWidget } from "@/components/dashboards/widgets/top-services-widget"
import type { DashboardMeta, DashboardWidget } from "@/lib/dashboards/types"
import type { LogEntry } from "@/lib/mock-data"

const ROW_HEIGHT_PX = 52

export function DashboardCanvas({
  dashboard,
  logs,
  editMode,
  selectedWidgetId,
  onSelectWidget,
  onDuplicateWidget,
  onRemoveWidget,
  onAddWidget,
}: {
  dashboard: DashboardMeta
  logs: LogEntry[]
  editMode: boolean
  selectedWidgetId: string | null
  onSelectWidget: (id: string | null) => void
  onDuplicateWidget: (widget: DashboardWidget) => void
  onRemoveWidget: (widgetId: string) => void
  onAddWidget: () => void
}) {
  const maxRow = React.useMemo(() => {
    if (dashboard.widgets.length === 0) return 8
    return Math.max(
      8,
      ...dashboard.widgets.map((w) => w.y + w.h + 1)
    )
  }, [dashboard.widgets])

  if (dashboard.widgets.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="flex size-14 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
          <LayoutGridIcon className="size-6 text-muted-foreground" />
        </div>
        <div className="max-w-sm text-center">
          <p className="text-[15px] font-semibold text-foreground">
            Build your dashboard
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Add log volume charts, tables, metrics, and notes. Data reflects your
            selected time range.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={onAddWidget}>
          <PlusIcon className="size-3.5" />
          Add first widget
        </Button>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-0 flex-1 overflow-auto p-4"
      style={{
        backgroundImage:
          "linear-gradient(to right, oklch(0.5 0.02 252 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.5 0.02 252 / 0.06) 1px, transparent 1px)",
        backgroundSize: "calc(100% / 12) 52px",
      }}
    >
      <div
        className="mx-auto grid w-full max-w-[1400px] gap-3"
        style={{
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gridTemplateRows: `repeat(${maxRow}, ${ROW_HEIGHT_PX}px)`,
        }}
      >
        {dashboard.widgets.map((widget) => (
          <DashboardWidgetFrame
            key={widget.id}
            widget={widget}
            editMode={editMode}
            selected={selectedWidgetId === widget.id}
            onSelect={() =>
              onSelectWidget(
                selectedWidgetId === widget.id ? null : widget.id
              )
            }
            onDuplicate={() => onDuplicateWidget(widget)}
            onRemove={() => onRemoveWidget(widget.id)}
          >
            <WidgetBody widget={widget} logs={logs} />
          </DashboardWidgetFrame>
        ))}
      </div>
    </div>
  )
}

function WidgetBody({
  widget,
  logs,
}: {
  widget: DashboardWidget
  logs: LogEntry[]
}) {
  const query = widget.config?.query

  switch (widget.type) {
    case "stat":
      return (
        <StatWidget
          logs={logs}
          kind={widget.config?.statKind}
          query={query}
        />
      )
    case "log_volume":
      return <LogVolumeWidget logs={logs} query={query} />
    case "logs_table":
      return (
        <LogsTableWidget
          logs={logs}
          query={query}
          limit={widget.config?.rowLimit ?? 12}
        />
      )
    case "top_services":
      return <TopServicesWidget logs={logs} query={query} />
    case "note":
      return <NoteWidget note={widget.config?.note} />
    default:
      return null
  }
}
