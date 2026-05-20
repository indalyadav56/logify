import type { DashboardWidgetType } from "@/lib/dashboards/types"

export const WIDGET_CATALOG: {
  type: DashboardWidgetType
  label: string
  description: string
  defaultW: number
  defaultH: number
  icon: string
}[] = [
  {
    type: "stat",
    label: "Metric",
    description: "Single KPI with trend",
    defaultW: 4,
    defaultH: 2,
    icon: "gauge",
  },
  {
    type: "log_volume",
    label: "Log volume",
    description: "Stacked volume by log level",
    defaultW: 8,
    defaultH: 4,
    icon: "chart",
  },
  {
    type: "logs_table",
    label: "Log table",
    description: "Scrollable recent log events",
    defaultW: 8,
    defaultH: 5,
    icon: "table",
  },
  {
    type: "top_services",
    label: "Top services",
    description: "Services ranked by event count",
    defaultW: 4,
    defaultH: 5,
    icon: "list",
  },
  {
    type: "note",
    label: "Note",
    description: "Markdown runbook or context",
    defaultW: 4,
    defaultH: 3,
    icon: "note",
  },
]

export const DASHBOARD_TIME_RANGES = [
  { id: "15m", label: "Last 15 minutes" },
  { id: "30m", label: "Last 30 minutes" },
  { id: "1h", label: "Last 1 hour" },
  { id: "2h", label: "Last 2 hours" },
  { id: "6h", label: "Last 6 hours" },
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
] as const
