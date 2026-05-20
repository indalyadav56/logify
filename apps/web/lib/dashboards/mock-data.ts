import type { DashboardMeta } from "@/lib/dashboards/types"

export const DEFAULT_DASHBOARD_ID = "dash-platform-health"

export const MOCK_DASHBOARDS: DashboardMeta[] = [
  {
    id: DEFAULT_DASHBOARD_ID,
    name: "Platform health",
    description: "Error trends, ingest volume, and live log stream",
    isFavorite: true,
    createdAt: "2026-02-10T08:00:00Z",
    updatedAt: "2026-05-20T04:00:00Z",
    createdBy: "Avery Moore",
    widgets: [
      {
        id: "w-stat-errors",
        type: "stat",
        title: "Error rate",
        x: 1,
        y: 1,
        w: 4,
        h: 2,
        config: { statKind: "error_rate" },
      },
      {
        id: "w-stat-ingest",
        type: "stat",
        title: "Ingest volume",
        x: 5,
        y: 1,
        w: 4,
        h: 2,
        config: { statKind: "ingest_volume" },
      },
      {
        id: "w-stat-alerts",
        type: "stat",
        title: "Open alerts",
        x: 9,
        y: 1,
        w: 4,
        h: 2,
        config: { statKind: "open_alerts" },
      },
      {
        id: "w-volume",
        type: "log_volume",
        title: "Log volume by level",
        x: 1,
        y: 3,
        w: 12,
        h: 4,
      },
      {
        id: "w-services",
        type: "top_services",
        title: "Top services",
        x: 1,
        y: 7,
        w: 4,
        h: 5,
      },
      {
        id: "w-logs",
        type: "logs_table",
        title: "Recent logs",
        x: 5,
        y: 7,
        w: 8,
        h: 5,
        config: { rowLimit: 12 },
      },
    ],
  },
  {
    id: "dash-payments-slo",
    name: "Payments SLO",
    description: "Checkout and billing service observability",
    isFavorite: true,
    createdAt: "2026-03-15T11:00:00Z",
    updatedAt: "2026-05-19T18:30:00Z",
    createdBy: "Jordan Kim",
    widgets: [
      {
        id: "w2-stat",
        type: "stat",
        title: "5xx error rate",
        x: 1,
        y: 1,
        w: 6,
        h: 2,
        config: { statKind: "error_rate", query: 'service:"payments-api"' },
      },
      {
        id: "w2-volume",
        type: "log_volume",
        title: "Payments traffic",
        x: 7,
        y: 1,
        w: 6,
        h: 4,
        config: { query: 'service:"payments-api"' },
      },
      {
        id: "w2-logs",
        type: "logs_table",
        title: "Payment errors",
        x: 1,
        y: 5,
        w: 12,
        h: 6,
        config: { query: 'level:error service:"payments-api"', rowLimit: 15 },
      },
    ],
  },
  {
    id: "dash-incident",
    name: "Incident room",
    description: "War-room layout for active investigations",
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-05-18T22:15:00Z",
    createdBy: "Sam Rivera",
    widgets: [
      {
        id: "w3-note",
        type: "note",
        title: "Runbook",
        x: 1,
        y: 1,
        w: 3,
        h: 3,
        config: {
          note:
            "1. Confirm blast radius in Top services\n2. Filter error logs below\n3. Escalate if error rate > 2% for 10m",
        },
      },
      {
        id: "w3-volume",
        type: "log_volume",
        title: "Error volume",
        x: 4,
        y: 1,
        w: 9,
        h: 4,
        config: { query: "level:error OR level:fatal" },
      },
      {
        id: "w3-logs",
        type: "logs_table",
        title: "Critical logs",
        x: 1,
        y: 5,
        w: 12,
        h: 6,
        config: { query: "level:error OR level:fatal", rowLimit: 20 },
      },
    ],
  },
  {
    id: "dash-untitled",
    name: "Untitled dashboard",
    description: "Start from scratch",
    createdAt: "2026-05-20T10:00:00Z",
    updatedAt: "2026-05-20T10:00:00Z",
    createdBy: "Avery Moore",
    widgets: [],
  },
]

export const DASHBOARD_TEMPLATES: Pick<
  DashboardMeta,
  "id" | "name" | "description" | "widgets"
>[] = [
  {
    id: "tpl-slo",
    name: "SLO overview",
    description: "Error rate, volume, and service breakdown",
    widgets: MOCK_DASHBOARDS[0].widgets,
  },
  {
    id: "tpl-incident",
    name: "Incident room",
    description: "Runbook note + error focus",
    widgets: MOCK_DASHBOARDS[2].widgets,
  },
]

export function getDashboardById(id: string) {
  return MOCK_DASHBOARDS.find((d) => d.id === id)
}

export function getRecentDashboards(limit = 5) {
  return [...MOCK_DASHBOARDS]
    .filter((d) => !d.isTemplate)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, limit)
}
