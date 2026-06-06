"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/auth-store"

/**
 * Sends already-signed-in visitors from the auth pages straight to the
 * dashboard. Renders children for everyone else (including while the session
 * is still resolving) so the login/signup forms stay snappy.
 */
export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  return <>{children}</>
}
