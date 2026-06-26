/**
 * Ergonomic input for {@link searchLogs}. `tenant_id` is accepted for backward
 * compatibility but ignored on the wire — the backend resolves the tenant from
 * the JWT. The client maps this into the nested wire shape ({@link LogsSearchWireBody}).
 */
export type LogsSearchBody = {
  /** Required: the active project to scope the search to. */
  project_id: string
  tenant_id?: string
  from: string
  to: string
  limit?: number
  cursor?: string
  body_contains?: string
  sort_desc?: boolean
}

/** Actual JSON shape the backend `SearchRequest` expects. */
export type LogsSearchWireBody = {
  project_id: string
  query?: string
  time_range: { from: string; to: string }
  limit?: number
  cursor?: string
  sort?: { field?: string; order: "asc" | "desc" }
}

/** Payload item from `POST /v1/logs/search`. */
export type RemoteLogRecord = {
  log_id: string
  tenant_id: string
  project_id: string
  timestamp: string
  severity: string
  service: string
  environment: string
  source: string
  trace_id: string
  span_id: string
  request_id?: string
  user_id?: string
  body: string
  tags: Record<string, string>
  ingestion_time: string
}

export type RemoteLogsSearchResponse = {
  logs: RemoteLogRecord[]
  total?: number
  next_cursor?: string
  took_ms?: number
}
