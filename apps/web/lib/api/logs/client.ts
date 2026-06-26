import { getStoredAccessToken } from "@/lib/auth-store"

import type {
  LogsSearchBody,
  LogsSearchWireBody,
  RemoteLogsSearchResponse,
} from "./types"

/** Map the ergonomic flat body to the backend's nested `SearchRequest` shape. */
function toWireBody(body: LogsSearchBody): LogsSearchWireBody {
  return {
    project_id: body.project_id,
    query: body.body_contains || undefined,
    time_range: { from: body.from, to: body.to },
    limit: body.limit,
    cursor: body.cursor,
    sort: { field: "timestamp", order: body.sort_desc === false ? "asc" : "desc" },
  }
}

/** Base URL without trailing slash (`NEXT_PUBLIC_LOGIFY_API_*` is inlined in the client bundle). */
export function getLogsSearchUrl(): string {
  const base = (
    process.env.NEXT_PUBLIC_LOGIFY_API_BASE_URL ?? "http://127.0.0.1:8080"
  ).replace(/\/$/, "")
  return `${base}/v1/logs/search`
}

/**
 * Browser `fetch` against the authenticated logs search API. The bearer token
 * is attached from the stored session; the backend resolves `tenant_id` from
 * the JWT. Returns the raw `{ logs, total, next_cursor }` payload.
 */
export async function searchLogs(
  body: LogsSearchBody
): Promise<RemoteLogsSearchResponse> {
  const url = getLogsSearchUrl()
  const token = getStoredAccessToken()

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(toWireBody(body)),
    })
  } catch {
    throw new Error("Can't reach the logs API. Check your connection.")
  }

  if (res.status === 401) {
    // Sign the user out so the route guard can redirect to /login.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("logify:unauthorized"))
    }
    throw new Error("Your session has expired. Please sign in again.")
  }

  const text = await res.text()
  let parsed:
    | (RemoteLogsSearchResponse & {
        error?: string | { message?: string }
        message?: string
      })
    | null = null
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    throw new Error("Invalid JSON from logs API")
  }

  if (!res.ok) {
    const err = parsed?.error
    const message =
      (typeof err === "string" ? err : err?.message) ??
      parsed?.message ??
      `Request failed (${res.status})`
    throw new Error(message)
  }

  return (parsed ?? { logs: [] }) as RemoteLogsSearchResponse
}
