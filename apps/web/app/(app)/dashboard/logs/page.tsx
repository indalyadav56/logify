"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, FolderPlus, Loader2, RefreshCw, ScrollText, Terminal } from "lucide-react"
import { useLogsStore } from "@/lib/logs-store"
import { useLogsData } from "@/lib/logs-data-context"
import { useProjectStore } from "@/lib/project-store"
import type { LogEntry } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { QueryBar } from "@/components/observability/query-bar"
import { LogDetail } from "@/components/observability/log-detail"
import { LogIngestionSetupDialog } from "@/components/observability/log-ingestion-setup-dialog"

const levelTone: Record<string, string> = {
  error: "border-red-200 bg-red-50 text-red-700", fatal: "border-red-200 bg-red-50 text-red-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700", info: "border-blue-200 bg-blue-50 text-blue-700",
  debug: "border-border bg-muted text-muted-foreground", trace: "border-border bg-muted text-muted-foreground",
}

export default function LogsPage() {
  const { query, setQuery, range, setRange, applyFilters } = useLogsStore()
  const { logs, totalHits, loading, error, refetch, hasMoreOlder, hasMoreNewer, loadOlder, loadNewer } = useLogsData()
  const { project, status, setCreateOpen } = useProjectStore()
  const [selected, setSelected] = useState<LogEntry | null>(null)
  const [connectOpen, setConnectOpen] = useState(false)
  const search = () => { applyFilters(); void refetch({ query, range }) }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col overflow-hidden px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
      <div className="mb-4 flex shrink-0 flex-wrap items-start justify-between gap-4 sm:mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Logs</h1>
        </div>
        <Button variant="outline" className="mt-1 gap-2 bg-white shadow-none" onClick={() => project ? setConnectOpen(true) : setCreateOpen(true)}>
          {project ? <Terminal className="size-4" /> : <FolderPlus className="size-4" />}{project ? "Connect a source" : "Create project"}
        </Button>
      </div>

      {!project ? (
        <Card className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto rounded-xl border bg-white p-8 text-center shadow-none ring-0">
          {status === "loading" ? <Loader2 className="size-5 animate-spin" /> : <>
            <div className="flex size-14 items-center justify-center rounded-xl border bg-muted/50"><FolderPlus className="size-6 text-muted-foreground" /></div>
            <div><h2 className="text-lg font-semibold">Start with a project</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Keep your application’s logs together in one place. Create a project to get started.</p></div>
            <Button onClick={() => setCreateOpen(true)}>Create project</Button>
          </>}
        </Card>
      ) : (
        <Card className="min-h-0 flex-1 gap-0 overflow-hidden rounded-xl border bg-white p-0 shadow-none ring-0">
          <div className="shrink-0 border-b p-4 sm:p-5"><QueryBar value={query} onChange={setQuery} range={range} onRangeChange={setRange} onRun={search} /></div>
          <div className="flex h-14 shrink-0 items-center justify-between px-5">
            <div className="flex items-center gap-2 text-sm font-medium">Results <Badge variant="secondary" className="rounded-md border-0 bg-muted px-2 font-normal tabular-nums">{loading ? "…" : totalHits.toLocaleString()}</Badge></div>
            <Button variant="ghost" size="sm" disabled={loading} onClick={search} className="gap-2 text-muted-foreground shadow-none"><RefreshCw className={loading ? "size-3.5 animate-spin" : "size-3.5"} />Refresh</Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" role="region" aria-label="Log results" tabIndex={0}>
            <Table className="min-w-[680px] table-fixed" containerClassName="shrink-0 overflow-visible">
              <TableHeader className="sticky top-0 z-10 bg-muted"><TableRow className="bg-muted hover:bg-muted">
                <TableHead className="h-11 w-[210px] pl-5 text-xs">Time</TableHead><TableHead className="w-[100px] text-xs">Level</TableHead><TableHead className="w-[180px] text-xs">Service</TableHead><TableHead className="text-xs">Message</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {logs.map(log => <TableRow key={log.id} className="cursor-pointer" onClick={() => setSelected(log)}>
                  <TableCell className="pl-5 font-mono text-xs text-muted-foreground"><time dateTime={log.timestamp}>{new Date(log.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</time></TableCell>
                  <TableCell><Badge variant="outline" className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${levelTone[log.level]}`}>{log.level}</Badge></TableCell>
                  <TableCell className="truncate text-xs font-medium" title={log.service}>{log.service || "—"}</TableCell>
                  <TableCell className="max-w-[700px] py-4 pr-5"><button type="button" className="block w-full truncate text-left font-mono text-xs outline-none focus-visible:underline" onClick={() => setSelected(log)} aria-label={`View log: ${log.message}`}>{log.message || "—"}</button></TableCell>
                </TableRow>)}
              </TableBody>
            </Table>
            {logs.length === 0 && <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center" role="status">
              <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border bg-muted/40">{loading ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : <ScrollText className="size-6 text-muted-foreground" />}</div>
              <h2 className="text-base font-semibold">{loading ? "Loading your logs…" : error ? "We couldn’t load your logs" : query ? "No matching logs" : "Your logs will show up here"}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{error ?? (query ? "Try another search or choose a wider time range." : "Connect your application to start collecting logs. If you’ve already connected it, try a wider time range.")}</p>
              {!loading && <Button variant="outline" onClick={error || query ? search : () => setConnectOpen(true)} className="mt-5 bg-white shadow-none">{error || query ? "Search again" : "Connect a source"}</Button>}
            </div>}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-xs text-muted-foreground">
            <span>{loading ? "Loading results…" : `${logs.length.toLocaleString()} logs shown`}</span>
            <div className="flex gap-2"><Button variant="outline" size="sm" disabled={loading || !hasMoreNewer} onClick={() => void loadNewer()} className="h-8 bg-white text-xs shadow-none"><ArrowLeft className="size-3.5" />Newer</Button><Button variant="outline" size="sm" disabled={loading || !hasMoreOlder} onClick={() => void loadOlder()} className="h-8 bg-white text-xs shadow-none">Older<ArrowRight className="size-3.5" /></Button></div>
          </div>
        </Card>
      )}
      <LogIngestionSetupDialog open={connectOpen} onOpenChange={setConnectOpen} />
      <Sheet open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(null) }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="border-b"><SheetTitle>Log details</SheetTitle><SheetDescription>Message and fields from this event.</SheetDescription></SheetHeader>
          {selected && <LogDetail entry={selected} onClose={() => setSelected(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}
