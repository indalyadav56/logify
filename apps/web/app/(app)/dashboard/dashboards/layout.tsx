import { DashboardsStoreProvider } from "@/lib/dashboards/dashboards-store"

export default function DashboardsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DashboardsStoreProvider>{children}</DashboardsStoreProvider>
}
