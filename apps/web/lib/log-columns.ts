import type { LogEntry } from "@/lib/mock-data"

export type LogColumnGroup = "core" | "field" | "attribute"

export type LogColumnDef = {
  id: string
  label: string
  group: LogColumnGroup
  defaultVisible: boolean
  /** Tailwind width class or arbitrary width for <th>/<td> */
  width?: string
  minWidth?: string
}

const FIELD_COLUMNS: LogColumnDef[] = [
  {
    id: "service",
    label: "Service",
    group: "field",
    defaultVisible: false,
    width: "w-[140px]",
    minWidth: "min-w-[120px]",
  },
  {
    id: "host",
    label: "Host",
    group: "field",
    defaultVisible: false,
    width: "w-[128px]",
    minWidth: "min-w-[108px]",
  },
  {
    id: "environment",
    label: "Environment",
    group: "field",
    defaultVisible: false,
    width: "w-[120px]",
    minWidth: "min-w-[100px]",
  },
  {
    id: "traceId",
    label: "Trace ID",
    group: "field",
    defaultVisible: false,
    width: "w-[152px]",
    minWidth: "min-w-[132px]",
  },
  {
    id: "spanId",
    label: "Span ID",
    group: "field",
    defaultVisible: false,
    width: "w-[108px]",
    minWidth: "min-w-[88px]",
  },
]

const CORE_COLUMNS: LogColumnDef[] = [
  {
    id: "timestamp",
    label: "Timestamp",
    group: "core",
    defaultVisible: true,
    width: "w-[172px]",
    minWidth: "min-w-[152px]",
  },
  {
    id: "level",
    label: "Status",
    group: "core",
    defaultVisible: true,
    width: "w-[96px]",
    minWidth: "min-w-[88px]",
  },
  {
    id: "message",
    label: "Message",
    group: "core",
    defaultVisible: true,
    minWidth: "min-w-[240px]",
  },
]

export const DEFAULT_VISIBLE_COLUMN_IDS = CORE_COLUMNS.filter(
  (c) => c.defaultVisible
).map((c) => c.id)

const ATTR_PREFIX = "attr."

export function attributeColumnId(key: string) {
  return `${ATTR_PREFIX}${key}`
}

export function isAttributeColumnId(id: string) {
  return id.startsWith(ATTR_PREFIX)
}

export function attributeKeyFromColumnId(id: string) {
  return id.slice(ATTR_PREFIX.length)
}

/** All columns available for the current log set (core + fields + discovered JSON keys). */
export function discoverLogColumns(logs: LogEntry[]): LogColumnDef[] {
  const attrKeys = new Set<string>()
  for (const log of logs) {
    for (const key of Object.keys(log.attributes)) {
      attrKeys.add(key)
    }
  }

  const attributeColumns: LogColumnDef[] = [...attrKeys]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
    id: attributeColumnId(key),
    label: key,
    group: "attribute" as const,
    defaultVisible: false,
    width: "w-[120px]",
    minWidth: "min-w-[100px]",
  }))

  return [...CORE_COLUMNS, ...FIELD_COLUMNS, ...attributeColumns]
}

export function getDefaultVisibleColumnIds(columns: LogColumnDef[]) {
  return columns.filter((c) => c.defaultVisible).map((c) => c.id)
}

export function orderVisibleColumns(
  allColumns: LogColumnDef[],
  visibleIds: string[]
): LogColumnDef[] {
  const byId = new Map(allColumns.map((c) => [c.id, c]))
  return visibleIds
    .map((id) => byId.get(id))
    .filter((c): c is LogColumnDef => c != null)
}

/** Merge discovered columns with any custom order; appends new ids at the end. */
export function mergeColumnOrder(
  previousOrder: string[],
  allColumns: LogColumnDef[]
): string[] {
  const allIds = allColumns.map((c) => c.id)
  const known = new Set(allIds)
  const ordered = previousOrder.filter((id) => known.has(id))
  for (const id of allIds) {
    if (!ordered.includes(id)) ordered.push(id)
  }
  return ordered
}

export function getLogCellValue(log: LogEntry, columnId: string): string {
  if (isAttributeColumnId(columnId)) {
    const key = attributeKeyFromColumnId(columnId)
    const value = log.attributes[key]
    if (value === undefined || value === null) return ""
    return String(value)
  }

  switch (columnId) {
    case "timestamp":
      return log.timestamp
    case "level":
      return log.level
    case "message":
      return log.message
    case "service":
      return log.service
    case "host":
      return log.host
    case "environment":
      return log.environment
    case "traceId":
      return log.traceId
    case "spanId":
      return log.spanId
    default:
      return ""
  }
}

export function isLogLevelColumn(columnId: string): columnId is "level" {
  return columnId === "level"
}

export const LOG_COLUMN_GROUP_LABELS: Record<LogColumnGroup, string> = {
  core: "Core",
  field: "Fields",
  attribute: "Log attributes (JSON)",
}
