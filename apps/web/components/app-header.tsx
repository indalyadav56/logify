"use client"

import { ChevronRight } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useProjectStore } from "@/lib/project-store"

export function AppHeader() {
  const { project } = useProjectStore()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-white px-4 sm:px-8">
      <SidebarTrigger className="rounded-md" />
      <div className="mr-1 h-4 w-px bg-border" />
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
        <span className="truncate text-muted-foreground">{project?.name ?? "Workspace"}</span>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-medium">Logs</span>
      </nav>
    </header>
  )
}
