import { MOCK_DASHBOARDS } from "./mock-data"

/** Demo dashboard IDs pre-rendered at build time. */
export function getDashboardStaticParams() {
  return MOCK_DASHBOARDS.map((dashboard) => ({
    dashboardId: dashboard.id,
  }))
}
