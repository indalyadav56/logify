"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import type { LogEntry } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function LogDetail({ entry, onClose }: { entry: LogEntry; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(entry, null, 2)); setCopied(true) }
    catch { toast.error("Couldn’t copy this log.") }
  }
  return <div className="space-y-7 p-6">
    <div className="flex items-center justify-between gap-3"><Badge variant="outline" className="rounded-md">{entry.level}</Badge><Button variant="outline" size="sm" onClick={() => void copy()} className="shadow-none">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Copied" : "Copy JSON"}</Button></div>
    <section><h3 className="mb-3 text-sm font-medium">Message</h3><p className="break-words rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-6">{entry.message || "No message"}</p></section>
    <section><h3 className="mb-2 text-sm font-medium">Event</h3><dl className="divide-y text-xs">{[["Timestamp", new Date(entry.timestamp).toLocaleString()], ["Service", entry.service], ["Host", entry.host], ["Environment", entry.environment], ["Trace ID", entry.traceId]].filter(([, v]) => Boolean(v)).map(([key, value]) => <div key={key} className="flex justify-between gap-6 py-3"><dt className="text-muted-foreground">{key}</dt><dd className="break-all text-right font-mono">{value}</dd></div>)}</dl></section>
    {Object.keys(entry.attributes).length > 0 && <section><h3 className="mb-3 text-sm font-medium">Attributes</h3><pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-6">{JSON.stringify(entry.attributes, null, 2)}</pre></section>}
    <Button variant="outline" onClick={onClose} className="w-full shadow-none">Close details</Button>
  </div>
}
