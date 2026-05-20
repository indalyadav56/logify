"use client"

import * as React from "react"
import { notFound } from "next/navigation"

import { AddWidgetSheet } from "@/components/dashboards/add-widget-sheet"
import { DashboardCanvas } from "@/components/dashboards/dashboard-canvas"
import { DashboardToolbar } from "@/components/dashboards/dashboard-toolbar"
import { useDashboardsStore } from "@/lib/dashboards/dashboards-store"
import { useLogsData } from "@/lib/logs-data-context"
import { useLogsStore } from "@/lib/logs-store"
import type { DashboardWidget } from "@/lib/dashboards/types"

export function DashboardView({ dashboardId }: { dashboardId: string }) {
  const {
    getDashboard,
    updateDashboard,
    addWidget,
    removeWidget,
  } = useDashboardsStore()
  const dashboard = getDashboard(dashboardId)
  const { chartLogs, refetch, loading } = useLogsData()
  const { appliedRange, setAppliedRange, setRange } = useLogsStore()

  const [editMode, setEditMode] = React.useState(false)
  const [selectedWidgetId, setSelectedWidgetId] = React.useState<string | null>(
    null
  )
  const [widgetSheetOpen, setWidgetSheetOpen] = React.useState(false)
  const [autoRefresh, setAutoRefresh] = React.useState(false)

  React.useEffect(() => {
    void refetch({ range: appliedRange })
  }, [appliedRange, refetch])

  React.useEffect(() => {
    if (!autoRefresh) return
    const id = window.setInterval(() => {
      void refetch({ range: appliedRange })
    }, 30_000)
    return () => window.clearInterval(id)
  }, [autoRefresh, appliedRange, refetch])

  if (!dashboard) {
    notFound()
  }

  const handleDuplicate = (widget: DashboardWidget) => {
    const copy: DashboardWidget = {
      ...widget,
      id: `w-${Date.now()}`,
      x: Math.min(widget.x + 1, 12 - widget.w + 1),
      y: widget.y + widget.h,
      title: `${widget.title} (copy)`,
    }
    updateDashboard(dashboardId, {
      widgets: [...dashboard.widgets, copy],
    })
    setSelectedWidgetId(copy.id)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardToolbar
        name={dashboard.name}
        editMode={editMode}
        onEditModeChange={(v) => {
          setEditMode(v)
          if (!v) setSelectedWidgetId(null)
        }}
        onNameChange={(name) => updateDashboard(dashboardId, { name })}
        timeRange={appliedRange}
        onTimeRangeChange={(range) => {
          setAppliedRange(range)
          setRange(range)
          void refetch({ range })
        }}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        onRefresh={() => void refetch({ range: appliedRange })}
        onAddWidget={() => setWidgetSheetOpen(true)}
        loading={loading}
      />

      <DashboardCanvas
        dashboard={dashboard}
        logs={chartLogs}
        editMode={editMode}
        selectedWidgetId={selectedWidgetId}
        onSelectWidget={setSelectedWidgetId}
        onDuplicateWidget={handleDuplicate}
        onRemoveWidget={(id) => {
          removeWidget(dashboardId, id)
          setSelectedWidgetId(null)
        }}
        onAddWidget={() => setWidgetSheetOpen(true)}
      />

      <AddWidgetSheet
        open={widgetSheetOpen}
        onOpenChange={setWidgetSheetOpen}
        onPick={(type) => addWidget(dashboardId, type)}
      />
    </div>
  )
}
