"use client"

import * as React from "react"

export type LogsFilterSelection = Record<string, Set<string>>

export type LogsStore = {
  query: string
  setQuery: (q: string) => void
  selection: LogsFilterSelection
  setSelection: (s: LogsFilterSelection) => void
  range: string
  setRange: (r: string) => void
  paused: boolean
  setPaused: (p: boolean) => void
}

const Ctx = React.createContext<LogsStore | null>(null)

export function LogsStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [query, setQuery] = React.useState("")
  const [selection, setSelection] = React.useState<LogsFilterSelection>({})
  const [range, setRange] = React.useState("30m")
  const [paused, setPaused] = React.useState(false)

  const value = React.useMemo<LogsStore>(
    () => ({
      query,
      setQuery,
      selection,
      setSelection,
      range,
      setRange,
      paused,
      setPaused,
    }),
    [query, selection, range, paused]
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
