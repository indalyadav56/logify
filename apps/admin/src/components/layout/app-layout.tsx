import { Outlet, useLocation } from "react-router-dom"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/users": "Users",
  "/organizations": "Organizations",
  "/projects": "Projects",
  "/billing": "Billing",
  "/system": "System health",
  "/audit-logs": "Audit logs",
  "/settings": "Settings",
}

export function AppLayout() {
  const { pathname } = useLocation()
  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/organizations/") ? "Organization" : "Logify Admin")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader title={title} />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
