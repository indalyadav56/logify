import { redirect } from "next/navigation"

import { DEFAULT_DASHBOARD_ID } from "@/lib/dashboards/mock-data"

export default function DashboardsIndexPage() {
  redirect(`/dashboard/dashboards/${DEFAULT_DASHBOARD_ID}`)
}
