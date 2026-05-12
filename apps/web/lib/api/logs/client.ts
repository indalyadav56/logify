import type { LogsSearchBody, RemoteLogsSearchResponse } from "./types"

/** Base URL without trailing slash (`NEXT_PUBLIC_LOGIFY_API_*` is inlined in the client bundle). */
export function getLogsSearchUrl(): string {
  const base = (
    process.env.NEXT_PUBLIC_LOGIFY_API_BASE_URL ?? "http://127.0.0.1:8080"
  ).replace(/\/$/, "")
  return `${base}/v1/logs/search`
}

/** Browser `fetch` against the logs API — handle CORS on the backend */
export async function searchLogs(
  body: LogsSearchBody
): Promise<RemoteLogsSearchResponse> {
  const url = getLogsSearchUrl()
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let parsed: RemoteLogsSearchResponse & { error?: string }
  try {
    parsed = JSON.parse(text) as RemoteLogsSearchResponse & { error?: string }
  } catch {
    throw new Error("Invalid JSON from logs API")
  }

  if (!res.ok) {
    throw new Error(parsed.error ?? `Request failed (${res.status})`)
  }

  return parsed
}
