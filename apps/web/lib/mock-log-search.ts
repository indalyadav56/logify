import type { LogEntry } from "@/lib/mock-data"
import { filterLogs, type LogsFilterSelection } from "@/lib/logs-store"
import { MOCK_LOG_POOL } from "@/lib/mock-log-pool"

export type MockLogSearchResult = {
  logs: LogEntry[]
  total: number
  hasMoreOlder: boolean
  hasMoreNewer: boolean
  nextOlderCursor: string | null
  nextNewerCursor: string | null
  allMatching: LogEntry[]
}

export function searchMockLogs(
  query: string,
  selection: LogsFilterSelection,
  cursor?: string | null,
  limit = 100
): MockLogSearchResult {
  // 1. Get all matches and sort descending (newest first)
  const allMatching = filterLogs(MOCK_LOG_POOL, query, selection)
  const sorted = [...allMatching].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  if (sorted.length === 0) {
    return {
      logs: [],
      total: 0,
      hasMoreOlder: false,
      hasMoreNewer: false,
      nextOlderCursor: null,
      nextNewerCursor: null,
      allMatching: [],
    }
  }

  let visible: LogEntry[] = []

  // 2. Paginate based on cursor
  if (!cursor) {
    visible = sorted.slice(0, limit)
  } else if (cursor.startsWith("older_")) {
    const tStr = cursor.substring(6)
    const tVal = new Date(tStr).getTime()
    const idx = sorted.findIndex((l) => new Date(l.timestamp).getTime() < tVal)
    if (idx === -1) {
      visible = sorted.slice(sorted.length - limit)
    } else {
      visible = sorted.slice(idx, idx + limit)
    }
  } else if (cursor.startsWith("newer_")) {
    const tStr = cursor.substring(6)
    const tVal = new Date(tStr).getTime()
    let idx = -1
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (new Date(sorted[i].timestamp).getTime() > tVal) {
        idx = i
        break
      }
    }
    if (idx === -1) {
      visible = sorted.slice(0, limit)
    } else {
      visible = sorted.slice(Math.max(0, idx - limit + 1), idx + 1)
    }
  } else {
    visible = sorted.slice(0, limit)
  }

  const firstVisibleId = visible[0]?.id
  const lastVisibleId = visible[visible.length - 1]?.id

  const firstIdx = sorted.findIndex((l) => l.id === firstVisibleId)
  const lastIdx = sorted.findIndex((l) => l.id === lastVisibleId)

  const hasMoreNewer = firstIdx > 0
  const hasMoreOlder = lastIdx !== -1 && lastIdx < sorted.length - 1

  const nextOlderCursor = hasMoreOlder
    ? "older_" + visible[visible.length - 1].timestamp
    : null
  const nextNewerCursor = hasMoreNewer ? "newer_" + visible[0].timestamp : null

  return {
    logs: visible,
    total: sorted.length,
    hasMoreOlder,
    hasMoreNewer,
    nextOlderCursor,
    nextNewerCursor,
    allMatching: sorted,
  }
}

export function getSurroundingLogs(
  targetLog: LogEntry,
  count = 50
): {
  logs: LogEntry[]
  hasMoreOlder: boolean
  hasMoreNewer: boolean
  nextOlderCursor: string | null
  nextNewerCursor: string | null
} {
  // Sort pool descending (newest first)
  const sorted = [...MOCK_LOG_POOL].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  const idx = sorted.findIndex((l) => l.id === targetLog.id)
  if (idx === -1) {
    return {
      logs: [targetLog],
      hasMoreOlder: false,
      hasMoreNewer: false,
      nextOlderCursor: null,
      nextNewerCursor: null,
    }
  }

  // Bounded slice around index
  const start = Math.max(0, idx - count)
  const end = Math.min(sorted.length, idx + count + 1)
  const visible = sorted.slice(start, end)

  const hasMoreNewer = start > 0
  const hasMoreOlder = end < sorted.length

  const nextOlderCursor = hasMoreOlder
    ? "older_" + sorted[end - 1].timestamp
    : null
  const nextNewerCursor = hasMoreNewer
    ? "newer_" + sorted[start].timestamp
    : null

  return {
    logs: visible,
    hasMoreOlder,
    hasMoreNewer,
    nextOlderCursor,
    nextNewerCursor,
  }
}
