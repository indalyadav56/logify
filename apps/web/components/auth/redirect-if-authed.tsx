"use client"

import * as React from "react"

import { destinationAfterAuth } from "@/lib/invitation-link"
import { useAuth } from "@/lib/auth-store"

/**
 * Sends signed-in visitors to the pending invitation or their dashboard. Renders children for everyone else (including while the session
 * is still resolving) so the login/signup forms stay snappy.
 */
export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()

  React.useEffect(() => {
    if (status === "authenticated") {
      // Reset client state after sign-in and preserve the invitation fragment.
      window.location.replace(destinationAfterAuth())
    }
  }, [status])

  return <>{children}</>
}
