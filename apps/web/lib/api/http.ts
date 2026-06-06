import { getStoredAccessToken } from "@/lib/auth-store"

import type { ApiEnvelope } from "@/lib/api/auth"

/** Base URL without trailing slash (`NEXT_PUBLIC_LOGIFY_API_*` is inlined in the client bundle). */
export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_LOGIFY_API_BASE_URL ?? "http://127.0.0.1:8080"
  ).replace(/\/$/, "")
}

/** Thrown when the API responds 401 — the caller should send the user to /login. */
export class UnauthorizedError extends Error {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  /** Attach the stored bearer token (default true). */
  auth?: boolean
}

/**
 * Authenticated JSON request against the Logify API. Attaches the bearer token,
 * unwraps the `{ success, data, error }` envelope, and surfaces backend error
 * messages. Returns `undefined` for empty (204) responses.
 */
export async function apiRequest<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"

  if (auth) {
    const token = getStoredAccessToken()
    if (!token) throw new UnauthorizedError()
    headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error("Can't reach the Logify API. Check your connection.")
  }

  if (res.status === 401) throw new UnauthorizedError()
  if (res.status === 204) return undefined as T

  const text = await res.text()
  let parsed: ApiEnvelope<T>
  try {
    parsed = JSON.parse(text) as ApiEnvelope<T>
  } catch {
    throw new Error(`Unexpected response from the server (${res.status}).`)
  }

  if (!res.ok || !parsed.success) {
    throw new Error(
      parsed.error?.message ?? parsed.message ?? `Request failed (${res.status}).`
    )
  }

  return parsed.data as T
}
