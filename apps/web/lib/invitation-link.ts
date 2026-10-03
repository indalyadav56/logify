"use client"

import { useCallback, useSyncExternalStore } from "react"

const tokenPattern = /^lgi_[A-Za-z0-9_-]{43}$/
function readToken(parameter: "token" | "invite"): string {
  const token = new URLSearchParams(window.location.hash.slice(1)).get(parameter) ?? ""
  return tokenPattern.test(token) ? token : ""
}
function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener)
  return () => window.removeEventListener("hashchange", listener)
}
const serverSnapshot = () => null

/** URL fragments keep invitation secrets out of HTTP requests and referrers. */
export function useInvitationToken(parameter: "token" | "invite"): string | null {
  const snapshot = useCallback(() => readToken(parameter), [parameter])
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot)
}

/** Only a validated invitation token can influence the post-auth destination. */
export function destinationAfterAuth(): string {
  const token = readToken("invite")
  return token ? `/invite#token=${encodeURIComponent(token)}` : "/dashboard/logs"
}
