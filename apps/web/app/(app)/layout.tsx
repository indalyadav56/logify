import * as React from "react"

import { AppShell } from "@/components/app-shell"
import { RequireAuth } from "@/components/auth/require-auth"

export default function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  )
}
