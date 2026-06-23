"use client"

import * as React from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppBar } from "@/components/app-bar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { LogsStoreProvider } from "@/lib/logs-store"
import { LogsDataProvider } from "@/lib/logs-data-context"
import { ProjectStoreProvider } from "@/lib/project-store"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={150}>
      <ProjectStoreProvider>
      <LogsStoreProvider>
        <LogsDataProvider>
          <SidebarProvider
            defaultOpen
            className="h-svh max-h-svh overflow-hidden bg-muted dark:bg-background"
          >
            <AppBar />
            <SidebarInset className="m-2 min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <AppHeader />
              <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                <AppSidebar />
                <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  {children}
                </section>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </LogsDataProvider>
      </LogsStoreProvider>
      </ProjectStoreProvider>
    </TooltipProvider>
  )
}
