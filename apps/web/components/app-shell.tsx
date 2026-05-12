"use client"

import * as React from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppBar } from "@/components/app-bar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { LogsStoreProvider } from "@/lib/logs-store"
import { LogsDataProvider } from "@/lib/logs-data-context"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={150}>
      <LogsStoreProvider>
        <LogsDataProvider>
          <SidebarProvider
            defaultOpen
            className="h-svh max-h-svh overflow-hidden"
          >
            <AppBar />
            <SidebarInset className="min-w-0 overflow-hidden">
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
    </TooltipProvider>
  )
}
