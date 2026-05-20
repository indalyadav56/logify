"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import {
  mapRemoteLogToLogEntry,
  searchLogs,
  timeRangeToIso,
} from "@/lib/api/logs"
import type { LogEntry } from "@/lib/mock-data"
import { getSurroundingLogs, searchMockLogs } from "@/lib/mock-log-search"
import { type LogsFilterSelection, useLogsStore } from "@/lib/logs-store"

export type LogsDataSource = "mock" | "api"

const PAGE_SIZE = 100

type RefetchOptions = {
  range?: string
  /** Draft filters to apply (e.g. on Run, before store commits). */
  query?: string
  selection?: LogsFilterSelection
  cursor?: string | null
}

type LogsDataContextValue = {
  logs: LogEntry[]
  totalHits: number
  hasMoreOlder: boolean
  hasMoreNewer: boolean
  nextOlderCursor: string | null
  nextNewerCursor: string | null
  dataSource: LogsDataSource
  loading: boolean
  error: string | null
  chartLogs: LogEntry[]
  refetch: (options?: RefetchOptions) => Promise<void>
  loadOlder: () => Promise<void>
  loadNewer: () => Promise<void>
  // Context Log Exploration
  contextLog: LogEntry | null
  setContextLog: (log: LogEntry | null) => void
}

const LogsDataCtx = React.createContext<LogsDataContextValue | null>(null)

export function LogsDataProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const { appliedQuery, appliedSelection, appliedRange } = useLogsStore()

  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [chartLogs, setChartLogs] = React.useState<LogEntry[]>([])
  const [totalHits, setTotalHits] = React.useState(0)
  const [hasMoreOlder, setHasMoreOlder] = React.useState(false)
  const [hasMoreNewer, setHasMoreNewer] = React.useState(false)
  const [nextOlderCursor, setNextOlderCursor] = React.useState<string | null>(null)
  const [nextNewerCursor, setNextNewerCursor] = React.useState<string | null>(null)

  const [dataSource, setDataSource] = React.useState<LogsDataSource>("mock")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Context log view states
  const [contextLog, setContextLogState] = React.useState<LogEntry | null>(null)
  const [searchCache, setSearchCache] = React.useState<{
    logs: LogEntry[]
    chartLogs: LogEntry[]
    totalHits: number
    hasMoreOlder: boolean
    hasMoreNewer: boolean
    nextOlderCursor: string | null
    nextNewerCursor: string | null
  } | null>(null)

  const onLogsRoute =
    pathname.startsWith("/dashboard/logs") ||
    pathname.startsWith("/dashboard/dashboards")

  const applyMockPage = React.useCallback(
    (
      query: string,
      selection: LogsFilterSelection,
      cursor: string | null
    ) => {
      const result = searchMockLogs(query, selection, cursor, PAGE_SIZE)
      setLogs(result.logs)
      setChartLogs(result.allMatching)
      setTotalHits(result.total)
      setHasMoreOlder(result.hasMoreOlder)
      setHasMoreNewer(result.hasMoreNewer)
      setNextOlderCursor(result.nextOlderCursor)
      setNextNewerCursor(result.nextNewerCursor)
      setDataSource("mock")
    },
    []
  )

  const fetchFromApi = React.useCallback(
    async (
      effectiveRange: string,
      query: string,
      cursor: string | null
    ) => {
      const { from, to } = timeRangeToIso(effectiveRange)
      const tenantId =
        process.env.NEXT_PUBLIC_LOGIFY_TENANT_ID ?? "acme-corp"

      const payload = await searchLogs({
        tenant_id: tenantId,
        from,
        to,
        limit: PAGE_SIZE,
        cursor: cursor ?? undefined,
        body_contains: query.trim() || undefined,
        sort_desc: true,
      })

      const mapped = (payload.logs ?? []).map(mapRemoteLogToLogEntry)
      const serverTotal = payload.total ?? 0
      const serverCursor = payload.next_cursor

      let hasMoreOlder = false
      let hasMoreNewer = false

      if (serverCursor) {
        hasMoreOlder = true
      } else if (mapped.length >= PAGE_SIZE) {
        hasMoreOlder = true
      }

      if (cursor != null) {
        hasMoreNewer = true
      }

      const calculatedOlder = hasMoreOlder
        ? "older_" + (mapped[mapped.length - 1]?.timestamp ?? "")
        : null
      const calculatedNewer = hasMoreNewer
        ? "newer_" + (mapped[0]?.timestamp ?? "")
        : null

      const total =
        serverTotal > 0
          ? serverTotal
          : hasMoreOlder
            ? PAGE_SIZE + 1
            : mapped.length

      setLogs(mapped)
      setChartLogs(mapped)
      setTotalHits(total)
      setHasMoreOlder(hasMoreOlder)
      setHasMoreNewer(hasMoreNewer)
      setNextOlderCursor(calculatedOlder)
      setNextNewerCursor(calculatedNewer)
      setDataSource("api")
    },
    []
  )

  const refetch = React.useCallback(
    async (options?: RefetchOptions) => {
      if (!onLogsRoute) return
      if (contextLog) return // Don't allow regular refetches when exploring context

      const query = options?.query ?? appliedQuery
      const selection = options?.selection ?? appliedSelection
      const cursor = options?.cursor ?? null
      const effectiveRange = options?.range ?? appliedRange

      setLoading(true)
      setError(null)

      const finish = () => {
        setLoading(false)
      }

      if (dataSource === "mock") {
        try {
          applyMockPage(query, selection, cursor)
        } finally {
          finish()
        }
        return
      }

      try {
        await fetchFromApi(effectiveRange, query, cursor)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load logs"
        setError(msg)
        applyMockPage(query, selection, cursor)
        if (!cursor) {
          toast.error("Could not load logs from API", { description: msg })
        }
      } finally {
        finish()
      }
    },
    [
      appliedQuery,
      appliedSelection,
      appliedRange,
      applyMockPage,
      dataSource,
      fetchFromApi,
      onLogsRoute,
      contextLog,
    ]
  )

  const loadOlder = React.useCallback(async () => {
    if (!nextOlderCursor || loading || contextLog) return
    await refetch({ cursor: nextOlderCursor })
  }, [loading, nextOlderCursor, refetch, contextLog])

  const loadNewer = React.useCallback(async () => {
    if (!nextNewerCursor || loading || contextLog) return
    await refetch({ cursor: nextNewerCursor })
  }, [loading, nextNewerCursor, refetch, contextLog])

  const setContextLog = React.useCallback(
    async (targetLog: LogEntry | null) => {
      if (targetLog) {
        // Capture search state if we aren't already in context mode
        if (!searchCache) {
          setSearchCache({
            logs,
            chartLogs,
            totalHits,
            hasMoreOlder,
            hasMoreNewer,
            nextOlderCursor,
            nextNewerCursor,
          })
        }

        setContextLogState(targetLog)
        setLoading(true)

        try {
          if (dataSource === "mock") {
            const result = getSurroundingLogs(targetLog, 50)
            setLogs(result.logs)
            setChartLogs(result.logs)
            setTotalHits(result.logs.length)
            setHasMoreOlder(false)
            setHasMoreNewer(false)
            setNextOlderCursor(null)
            setNextNewerCursor(null)
          } else {
            // API mode context search: query ±1m timeframe around log with NO query or filters
            const targetTime = new Date(targetLog.timestamp).getTime()
            const fromIso = new Date(targetTime - 60 * 1000).toISOString()
            const toIso = new Date(targetTime + 60 * 1000).toISOString()
            const tenantId = process.env.NEXT_PUBLIC_LOGIFY_TENANT_ID ?? "acme-corp"

            const payload = await searchLogs({
              tenant_id: tenantId,
              from: fromIso,
              to: toIso,
              limit: PAGE_SIZE,
              sort_desc: true,
            })

            const mapped = (payload.logs ?? []).map(mapRemoteLogToLogEntry)
            setLogs(mapped)
            setChartLogs(mapped)
            setTotalHits(mapped.length)
            setHasMoreOlder(false)
            setHasMoreNewer(false)
            setNextOlderCursor(null)
            setNextNewerCursor(null)
          }
        } catch (e) {
          toast.error("Failed to load surrounding logs context")
        } finally {
          setLoading(false)
        }
      } else {
        // Exit context mode and restore search results
        setContextLogState(null)
        if (searchCache) {
          setLogs(searchCache.logs)
          setChartLogs(searchCache.chartLogs)
          setTotalHits(searchCache.totalHits)
          setHasMoreOlder(searchCache.hasMoreOlder)
          setHasMoreNewer(searchCache.hasMoreNewer)
          setNextOlderCursor(searchCache.nextOlderCursor)
          setNextNewerCursor(searchCache.nextNewerCursor)
          setSearchCache(null)
        }
      }
    },
    [
      logs,
      chartLogs,
      totalHits,
      hasMoreOlder,
      hasMoreNewer,
      nextOlderCursor,
      nextNewerCursor,
      searchCache,
      dataSource,
    ]
  )

  React.useEffect(() => {
    if (!onLogsRoute) return
    applyMockPage(appliedQuery, appliedSelection, null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLogsRoute])

  const value = React.useMemo(
    (): LogsDataContextValue => ({
      logs,
      totalHits,
      hasMoreOlder,
      hasMoreNewer,
      nextOlderCursor,
      nextNewerCursor,
      dataSource,
      loading,
      error,
      chartLogs,
      refetch,
      loadOlder,
      loadNewer,
      contextLog,
      setContextLog,
    }),
    [
      logs,
      totalHits,
      hasMoreOlder,
      hasMoreNewer,
      nextOlderCursor,
      nextNewerCursor,
      dataSource,
      loading,
      error,
      chartLogs,
      refetch,
      loadOlder,
      loadNewer,
      contextLog,
      setContextLog,
    ]
  )

  return (
    <LogsDataCtx.Provider value={value}>{children}</LogsDataCtx.Provider>
  )
}

export function useLogsData(): LogsDataContextValue {
  const ctx = React.useContext(LogsDataCtx)
  if (!ctx) {
    throw new Error("useLogsData must be used within LogsDataProvider")
  }
  return ctx
}
