/**
 * Logs HTTP API — types, transport, mapping to UI models.
 *
 * Import from `@/lib/api/logs` (barrel).
 */
export type {
  LogsSearchBody,
  RemoteLogRecord,
  RemoteLogsSearchResponse,
} from "../logs/types"
export { getLogsSearchUrl, searchLogs } from "../logs/client"
export { timeRangeToIso } from "../logs/time-range"
export { mapRemoteLogToLogEntry, mapSeverityToLogLevel } from "../logs/mappers"
