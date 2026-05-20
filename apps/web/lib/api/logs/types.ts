/** `POST .../v1/logs/search` request body */
export type LogsSearchBody = {
  tenant_id: string
  from: string
  to: string
  limit?: number
  cursor?: string
  body_contains?: string
  sort_desc?: boolean
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
