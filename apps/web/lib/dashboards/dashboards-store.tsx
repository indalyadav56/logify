"use client"

import * as React from "react"

import {
  DEFAULT_DASHBOARD_ID,
  MOCK_DASHBOARDS,
  getDashboardById,
} from "@/lib/dashboards/mock-data"
import type { DashboardMeta, DashboardWidget } from "@/lib/dashboards/types"
import { WIDGET_CATALOG } from "@/lib/dashboards/widget-catalog"

const STORAGE_KEY = "logify:dashboards"

type DashboardsStoreValue = {
  dashboards: DashboardMeta[]
  getDashboard: (id: string) => DashboardMeta | undefined
  updateDashboard: (id: string, patch: Partial<DashboardMeta>) => void
  createDashboard: (name: string) => DashboardMeta
  duplicateDashboard: (id: string) => DashboardMeta
  addWidget: (dashboardId: string, type: DashboardWidget["type"]) => void
  updateWidget: (
    dashboardId: string,
    widgetId: string,
    patch: Partial<DashboardWidget>
  ) => void
  removeWidget: (dashboardId: string, widgetId: string) => void
}

const DashboardsCtx = React.createContext<DashboardsStoreValue | null>(null)

function loadPersisted(): DashboardMeta[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DashboardMeta[]
  } catch {
    return null
  }
}

function nextWidgetY(widgets: DashboardWidget[]) {
  if (widgets.length === 0) return 1
  return Math.max(...widgets.map((w) => w.y + w.h)) + 1
}

export function DashboardsStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [dashboards, setDashboards] = React.useState<DashboardMeta[]>(
    MOCK_DASHBOARDS
  )

  React.useEffect(() => {
    const saved = loadPersisted()
    if (saved?.length) setDashboards(saved)
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards))
    } catch {
      /* ignore */
    }
  }, [dashboards])

  const getDashboard = React.useCallback(
    (id: string) => dashboards.find((d) => d.id === id) ?? getDashboardById(id),
    [dashboards]
  )

  const updateDashboard = React.useCallback(
    (id: string, patch: Partial<DashboardMeta>) => {
      setDashboards((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, ...patch, updatedAt: new Date().toISOString() }
            : d
        )
      )
    },
    []
  )

  const createDashboard = React.useCallback((name: string) => {
    const dash: DashboardMeta = {
      id: `dash-${Date.now()}`,
      name: name.trim() || "Untitled dashboard",
      widgets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "Avery Moore",
    }
    setDashboards((prev) => [dash, ...prev])
    return dash
  }, [])

  const duplicateDashboard = React.useCallback((id: string) => {
    const source = dashboards.find((d) => d.id === id)
    if (!source) {
      return createDashboard("Copy of dashboard")
    }
    const dash: DashboardMeta = {
      ...source,
      id: `dash-${Date.now()}`,
      name: `${source.name} (copy)`,
      widgets: source.widgets.map((w) => ({
        ...w,
        id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setDashboards((prev) => [dash, ...prev])
    return dash
  }, [createDashboard, dashboards])

  const addWidget = React.useCallback(
    (dashboardId: string, type: DashboardWidget["type"]) => {
      const catalog = WIDGET_CATALOG.find((c) => c.type === type)
      if (!catalog) return

      setDashboards((prev) =>
        prev.map((d) => {
          if (d.id !== dashboardId) return d
          const y = nextWidgetY(d.widgets)
          const widget: DashboardWidget = {
            id: `w-${Date.now()}`,
            type,
            title: catalog.label,
            x: 1,
            y,
            w: catalog.defaultW,
            h: catalog.defaultH,
            config:
              type === "stat"
                ? { statKind: "error_rate" }
                : type === "note"
                  ? { note: "Add context for your team." }
                  : undefined,
          }
          return {
            ...d,
            widgets: [...d.widgets, widget],
            updatedAt: new Date().toISOString(),
          }
        })
      )
    },
    []
  )

  const updateWidget = React.useCallback(
    (
      dashboardId: string,
      widgetId: string,
      patch: Partial<DashboardWidget>
    ) => {
      setDashboards((prev) =>
        prev.map((d) => {
          if (d.id !== dashboardId) return d
          return {
            ...d,
            widgets: d.widgets.map((w) =>
              w.id === widgetId ? { ...w, ...patch } : w
            ),
            updatedAt: new Date().toISOString(),
          }
        })
      )
    },
    []
  )

  const removeWidget = React.useCallback(
    (dashboardId: string, widgetId: string) => {
      setDashboards((prev) =>
        prev.map((d) => {
          if (d.id !== dashboardId) return d
          return {
            ...d,
            widgets: d.widgets.filter((w) => w.id !== widgetId),
            updatedAt: new Date().toISOString(),
          }
        })
      )
    },
    []
  )

  const value = React.useMemo(
    () => ({
      dashboards,
      getDashboard,
      updateDashboard,
      createDashboard,
      duplicateDashboard,
      addWidget,
      updateWidget,
      removeWidget,
    }),
    [
      dashboards,
      getDashboard,
      updateDashboard,
      createDashboard,
      duplicateDashboard,
      addWidget,
      updateWidget,
      removeWidget,
    ]
  )

  return (
    <DashboardsCtx.Provider value={value}>{children}</DashboardsCtx.Provider>
  )
}

export function useDashboardsStore() {
  const ctx = React.useContext(DashboardsCtx)
  if (!ctx) {
    throw new Error("useDashboardsStore must be used within DashboardsStoreProvider")
  }
  return ctx
}

export { DEFAULT_DASHBOARD_ID }
