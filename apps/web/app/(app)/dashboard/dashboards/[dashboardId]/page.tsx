import { DashboardView } from "@/components/dashboards/dashboard-view"
import { DashboardsSidebar } from "@/components/dashboards/dashboards-sidebar"
import { getDashboardStaticParams } from "@/lib/dashboards/static-params"

type PageProps = {
  params: Promise<{ dashboardId: string }>
}

export function generateStaticParams() {
  return getDashboardStaticParams()
}

export default async function DashboardEditorPage({ params }: PageProps) {
  const { dashboardId } = await params

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <DashboardsSidebar activeId={dashboardId} />
      <DashboardView dashboardId={dashboardId} />
    </div>
  )
}
