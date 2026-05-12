import type { LogEntry, LogLevel } from "@/lib/mock-data"

import type { RemoteLogRecord } from "./types"

export function mapSeverityToLogLevel(severity: string): LogLevel {
  const s = severity.trim().toLowerCase()
  if (
    s === "trace" ||
    s === "debug" ||
    s === "info" ||
    s === "warn" ||
    s === "warning" ||
    s === "error" ||
    s === "fatal" ||
    s === "critical"
  ) {
    if (s === "warning") return "warn"
    if (s === "critical") return "fatal"
    return s as LogLevel
  }
  return "info"
}

function normalizeEnvironment(
  raw: string
): "production" | "staging" | "development" {
  const envRaw = raw.trim().toLowerCase() || "development"
  if (envRaw === "production" || envRaw === "staging" || envRaw === "development")
    return envRaw
  if (envRaw.includes("prod")) return "production"
  if (envRaw.includes("stage")) return "staging"
  return "development"
}

export function mapRemoteLogToLogEntry(row: RemoteLogRecord): LogEntry {
  const environment = normalizeEnvironment(
    row.environment ?? "development"
  )

  const tags = row.tags ?? {}
  const host =
    [tags.cluster, tags.region].filter(Boolean).join(" · ") ||
    tags.region ||
    tags.cluster ||
    "—"

  const attributes: Record<string, string | number | boolean> = {
    ...tags,
    tenant_id: row.tenant_id,
    project_id: row.project_id,
    source: row.source,
    request_id: row.request_id ?? "",
    user_id: row.user_id ?? "",
    ingestion_time: row.ingestion_time,
    log_id: row.log_id,
  }

  return {
    id: row.log_id,
    timestamp: row.timestamp,
    level: mapSeverityToLogLevel(row.severity),
    service: row.service,
    host,
    environment,
    message: row.body,
    traceId: row.trace_id,
    spanId: row.span_id,
    attributes,
  }
}
