import { AppSidebar } from "@/components/sidebar/AppSidebar"
import { Header } from "./Header"
import { Outlet } from "react-router-dom"

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar />
      <div className="flex min-h-screen flex-col sm:pl-64">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
