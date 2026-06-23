import * as React from "react"

import { RequireAuth } from "@/components/auth/require-auth"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProjectStoreProvider } from "@/lib/project-store"

/**
 * Account-level shell (no project sidebar). Wraps the project picker that the
 * user lands on after signing in, before entering a specific project.
 */
export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RequireAuth>
      <TooltipProvider delayDuration={150}>
        <ProjectStoreProvider>{children}</ProjectStoreProvider>
      </TooltipProvider>
    </RequireAuth>
  )
}
