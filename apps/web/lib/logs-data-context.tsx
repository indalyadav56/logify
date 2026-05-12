"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import {
  mapRemoteLogToLogEntry,
  searchLogs,
  timeRangeToIso,
} from "@/lib/api/logs"
import { logs as MOCK_LOGS, type LogEntry } from "@/lib/mock-data"
import { useLogsStore } from "@/lib/logs-store"

export type LogsDataSource = "mock" | "api"

type LogsDataContextValue = {
  logs: LogEntry[]
  dataSource: LogsDataSource
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const LogsDataCtx = React.createContext<LogsDataContextValue | null>(null)

function cloneMockLogs(): LogEntry[] {
  return MOCK_LOGS.map((entry) => ({
    ...entry,
    attributes: { ...entry.attributes },
  }))
}

export function LogsDataProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const { range } = useLogsStore()

  const [logs, setLogs] = React.useState<LogEntry[]>(cloneMockLogs)
  const [dataSource, setDataSource] = React.useState<LogsDataSource>("mock")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onLogsRoute = pathname.startsWith("/dashboard/logs")

  const refetch = React.useCallback(async () => {
    if (!onLogsRoute) return

    setLoading(true)
    setError(null)

    try {
      const { from, to } = timeRangeToIso(range)
      const tenantId =
        process.env.NEXT_PUBLIC_LOGIFY_TENANT_ID ?? "acme-corp"

      const payload = await searchLogs({
        tenant_id: tenantId,
        from,
        to,
      })

      const mapped = (payload.logs ?? []).map(mapRemoteLogToLogEntry)
      setLogs(mapped)
      setDataSource("api")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load logs"
      setError(msg)
      setLogs(cloneMockLogs())
      setDataSource("mock")
      toast.error("Could not load logs from API", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [range, onLogsRoute])

  React.useEffect(() => {
    if (!onLogsRoute) return
    refetch().catch(() => {})
  }, [refetch, onLogsRoute])

  const value = React.useMemo(
    (): LogsDataContextValue => ({
      logs,
      dataSource,
      loading,
      error,
      refetch,
    }),
    [logs, dataSource, loading, error, refetch]
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
