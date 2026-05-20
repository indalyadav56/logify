"use client"

import * as React from "react"

import type { LogEntry } from "@/lib/mock-data"

export type LogsFilterSelection = Record<string, Set<string>>

export type LogsStore = {
  /** Draft values (UI); applied on Run only */
  query: string
  setQuery: (q: string) => void
  selection: LogsFilterSelection
  setSelection: (s: LogsFilterSelection) => void
  range: string
  setRange: (r: string) => void
  /** Applied values (table, chart, API) */
  appliedQuery: string
  appliedSelection: LogsFilterSelection
  appliedRange: string
  setAppliedRange: (r: string) => void
  applyFilters: () => void
}

const Ctx = React.createContext<LogsStore | null>(null)

export function cloneSelection(s: LogsFilterSelection): LogsFilterSelection {
  const next: LogsFilterSelection = {}
  for (const [key, values] of Object.entries(s)) {
    next[key] = new Set(values)
  }
  return next
}

export function filterLogs(
  logs: LogEntry[],
  query: string,
  selection: LogsFilterSelection
): LogEntry[] {
  const q = query.trim().toLowerCase()
  return logs.filter((log) => {
    if (q) {
      const matches =
        log.message.toLowerCase().includes(q) ||
        log.service.toLowerCase().includes(q) ||
        log.host.toLowerCase().includes(q) ||
        log.traceId.toLowerCase().includes(q)
      if (!matches) return false
    }
    if (selection.level?.size && !selection.level.has(log.level)) return false
    if (selection.service?.size && !selection.service.has(log.service))
      return false
    if (selection.host?.size && !selection.host.has(log.host)) return false
    if (
      selection.environment?.size &&
      !selection.environment.has(log.environment)
    )
      return false
    const pid = String(log.attributes.project_id ?? "")
    if (selection.project_id?.size && (!pid || !selection.project_id.has(pid)))
      return false
    const regionAttr = String(log.attributes.region ?? "")
    if (
      selection.api_region?.size &&
      (!regionAttr || !selection.api_region.has(regionAttr))
    )
      return false
    return true
  })
}

export function LogsStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [query, setQuery] = React.useState("")
  const [selection, setSelection] = React.useState<LogsFilterSelection>({})
  const [range, setRange] = React.useState("30m")

  const [appliedQuery, setAppliedQuery] = React.useState("")
  const [appliedSelection, setAppliedSelection] =
    React.useState<LogsFilterSelection>({})
  const [appliedRange, setAppliedRange] = React.useState("30m")

  const applyFilters = React.useCallback(() => {
    setAppliedQuery(query)
    setAppliedSelection(cloneSelection(selection))
    setAppliedRange(range)
  }, [query, selection, range])

  const value = React.useMemo<LogsStore>(
    () => ({
      query,
      setQuery,
      selection,
      setSelection,
      range,
      setRange,
      appliedQuery,
      appliedSelection,
      appliedRange,
      setAppliedRange,
      applyFilters,
    }),
    [
      query,
      selection,
      range,
      appliedQuery,
      appliedSelection,
      appliedRange,
      applyFilters,
    ]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLogsStore(): LogsStore {
  const ctx = React.useContext(Ctx)
  if (!ctx) {
    throw new Error("useLogsStore must be used within a LogsStoreProvider")
  }
  return ctx
}
