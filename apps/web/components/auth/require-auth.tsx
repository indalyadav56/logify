"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LoaderIcon } from "lucide-react"

import { useAuth } from "@/lib/auth-store"

/**
 * Client-side route guard. The app is a static export, so authentication is
 * enforced in the browser: until a valid session is found in storage we render
 * a loader, and unauthenticated visitors are redirected to `/login`. Dashboard
 * content is never rendered without a session.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  if (status !== "authenticated") {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-background">
        <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
        <span className="sr-only">Checking your session…</span>
      </div>
    )
  }

  return <>{children}</>
}
