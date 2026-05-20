import { MOCK_DASHBOARDS } from "./mock-data"

/** IDs pre-rendered at build time when `output: "export"` is enabled. */
export function getDashboardStaticParams() {
  return MOCK_DASHBOARDS.map((dashboard) => ({
    dashboardId: dashboard.id,
  }))
}
