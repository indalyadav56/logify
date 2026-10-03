"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AppBar } from "@/components/app-bar"
import { AppHeader } from "@/components/app-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { LogsStoreProvider } from "@/lib/logs-store"
import { LogsDataProvider } from "@/lib/logs-data-context"
import { ProjectStoreProvider } from "@/lib/project-store"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ProjectStoreProvider>
        <LogsStoreProvider>
          <LogsDataProvider>
            <SidebarProvider
              defaultOpen
              className="h-dvh min-h-0 overflow-hidden"
              style={{ "--sidebar-width": "240px" } as React.CSSProperties}
            >
              <AppBar />
              <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
                <AppHeader />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          </LogsDataProvider>
        </LogsStoreProvider>
      </ProjectStoreProvider>
    </TooltipProvider>
  )
}
