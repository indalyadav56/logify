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
import { type LogsFilterSelection, useLogsStore } from "@/lib/logs-store"
import { useProjectStore } from "@/lib/project-store"
import { useAuth } from "@/lib/auth-store"

export type LogsDataSource = "api"

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
  const { appliedQuery, appliedRange } = useLogsStore()
  const { project } = useProjectStore()
  const { user } = useAuth()
  // The backend scopes logs by tenant, which for this API equals the user id
  // (the JWT `tenant_id` claim). Fall back to the env override when present.
  const tenantId =
    process.env.NEXT_PUBLIC_LOGIFY_TENANT_ID ?? user?.id ?? ""

  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [chartLogs, setChartLogs] = React.useState<LogEntry[]>([])
  const [totalHits, setTotalHits] = React.useState(0)
  const [hasMoreOlder, setHasMoreOlder] = React.useState(false)
  const [hasMoreNewer, setHasMoreNewer] = React.useState(false)
  const [nextOlderCursor, setNextOlderCursor] = React.useState<string | null>(null)
  const [nextNewerCursor, setNextNewerCursor] = React.useState<string | null>(null)

  const [dataSource] = React.useState<LogsDataSource>("api")
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

  /** Reset to an empty result set (no project, no data, or on error). */
  const applyEmpty = React.useCallback(() => {
    setLogs([])
    setChartLogs([])
    setTotalHits(0)
    setHasMoreOlder(false)
    setHasMoreNewer(false)
    setNextOlderCursor(null)
    setNextNewerCursor(null)
  }, [])

  const fetchFromApi = React.useCallback(
    async (
      effectiveRange: string,
      query: string,
      cursor: string | null
    ) => {
      const { from, to } = timeRangeToIso(effectiveRange)

      const payload = await searchLogs({
        project_id: project?.id ?? "",
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
    },
    [tenantId, project?.id]
  )

  const refetch = React.useCallback(
    async (options?: RefetchOptions) => {
      if (!onLogsRoute) return
      if (contextLog) return // Don't allow regular refetches when exploring context

      // No active project → nothing to show. Keep the view empty.
      if (!project) {
        applyEmpty()
        setError(null)
        setLoading(false)
        return
      }

      const query = options?.query ?? appliedQuery
      const cursor = options?.cursor ?? null
      const effectiveRange = options?.range ?? appliedRange

      setLoading(true)
      setError(null)

      try {
        await fetchFromApi(effectiveRange, query, cursor)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load logs"
        setError(msg)
        applyEmpty()
        if (!cursor) {
          toast.error("Could not load logs", { description: msg })
        }
      } finally {
        setLoading(false)
      }
    },
    [
      appliedQuery,
      appliedRange,
      applyEmpty,
      fetchFromApi,
      onLogsRoute,
      contextLog,
      project,
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
          // API context search: ±1m around the anchor log, no query or filters.
          const targetTime = new Date(targetLog.timestamp).getTime()
          const fromIso = new Date(targetTime - 60 * 1000).toISOString()
          const toIso = new Date(targetTime + 60 * 1000).toISOString()

          const payload = await searchLogs({
            project_id: project?.id ?? "",
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
      tenantId,
    ]
  )

  // Load (or clear) logs whenever the route or the active project changes.
  React.useEffect(() => {
    if (!onLogsRoute) return
    if (!project) {
      applyEmpty()
      return
    }
    void refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLogsRoute, project?.id])

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
