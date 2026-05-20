export type DashboardWidgetType =
  | "stat"
  | "log_volume"
  | "logs_table"
  | "top_services"
  | "note"

export type StatMetricKind = "error_rate" | "ingest_volume" | "open_alerts"

export type DashboardWidget = {
  id: string
  type: DashboardWidgetType
  title: string
  x: number
  y: number
  w: number
  h: number
  config?: {
    statKind?: StatMetricKind
    query?: string
    rowLimit?: number
    note?: string
  }
}

export type DashboardMeta = {
  id: string
  name: string
  description?: string
  isFavorite?: boolean
  isTemplate?: boolean
  updatedAt: string
  createdAt: string
  createdBy: string
  widgets: DashboardWidget[]
}

export type DashboardListItem = Pick<
  DashboardMeta,
  "id" | "name" | "description" | "updatedAt" | "isFavorite" | "isTemplate"
>
