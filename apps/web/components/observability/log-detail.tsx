"use client"

import * as React from "react"
import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  PinIcon,
  ScrollTextIcon,
  SparklesIcon,
  WaypointsIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { type LogEntry, type LogLevel } from "@/lib/mock-data"

const LEVEL_BAR: Record<LogLevel, string> = {
  trace: "bg-zinc-500",
  debug: "bg-sky-500",
  info: "bg-emerald-500",
  warn: "bg-amber-500",
  error: "bg-rose-500",
  fatal: "bg-fuchsia-500",
}

const LEVEL_TEXT: Record<LogLevel, string> = {
  trace: "text-zinc-500",
  debug: "text-sky-500",
  info: "text-emerald-500",
  warn: "text-amber-500",
  error: "text-rose-500",
  fatal: "text-fuchsia-500",
}

export function LogDetail({
  entry,
  onClose,
}: {
  entry: LogEntry
  onClose: () => void
}) {
  const ts = new Date(entry.timestamp)
  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <span className={cn("size-2 rounded-full", LEVEL_BAR[entry.level])} />
        <div className="flex-1 truncate">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[12px] tabular-nums">
              {ts.toLocaleString([], { hour12: false })}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              .{ts.getMilliseconds().toString().padStart(3, "0")}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>
              status:
              <span className={cn("ml-1 font-mono uppercase", LEVEL_TEXT[entry.level])}>
                {entry.level}
              </span>
            </span>
            <span>·</span>
            <span className="font-mono">{entry.service}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon-xs" aria-label="Pin">
          <PinIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          aria-label="Close"
        >
          <XIcon />
        </Button>
      </header>

      <div className="flex flex-wrap gap-1.5 border-b px-3 py-2">
        <Button variant="outline" size="xs" className="gap-1">
          <ScrollTextIcon /> Surrounding logs
        </Button>
        <Button variant="outline" size="xs" className="gap-1">
          <WaypointsIcon /> View trace
        </Button>
        <Button variant="outline" size="xs" className="gap-1">
          <ArrowUpRightIcon /> User session
        </Button>
        <Button variant="outline" size="xs" className="gap-1 ml-auto">
          <SparklesIcon className="text-violet-500" /> Explain with AI
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="Message" actions={<CopyButton value={entry.message} />}>
          <p className="rounded-md bg-muted/40 px-3 py-2 font-mono text-[12.5px] leading-relaxed break-words">
            {entry.message}
          </p>
        </Section>

        <Section title="Content">
          <Tabs defaultValue="json" className="gap-2">
            <TabsList variant="line" className="self-start">
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="raw">Raw</TabsTrigger>
              <TabsTrigger value="formatted">Formatted</TabsTrigger>
            </TabsList>
            <TabsContent value="json">
              <JsonTree data={buildPayload(entry)} />
            </TabsContent>
            <TabsContent value="raw">
              <pre className="overflow-auto rounded-md bg-muted/40 p-3 font-mono text-[11.5px] leading-relaxed">
                {`${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.service} (host=${entry.host}) trace=${entry.traceId} span=${entry.spanId}\n  ${entry.message}`}
              </pre>
            </TabsContent>
            <TabsContent value="formatted">
              <div className="space-y-1 rounded-md border bg-card p-3 text-[12px]">
                {Object.entries(buildPayload(entry)).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="truncate font-mono">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Topology">
          <div className="grid grid-cols-2 gap-1.5 text-[12px]">
            <KV label="dt.source_entity" value={`HOST-${entry.host.toUpperCase()}`} />
            <KV label="dt.entity.host" value={`HOST-${entry.host.toUpperCase()}`} />
            <KV label="dt.process.name" value={`${entry.service}-runtime`} />
            <KV label="dt.kubernetes.cluster" value="prod-eu" />
          </div>
        </Section>

        <Section title="Fields">
          <div className="grid grid-cols-2 gap-1.5 text-[12px]">
            <KV label="timestamp" value={entry.timestamp} />
            <KV label="host.name" value={entry.host} />
            <KV label="service" value={entry.service} />
            <KV label="environment" value={entry.environment} />
            <KV label="trace.id" value={entry.traceId} mono />
            <KV label="span.id" value={entry.spanId} mono />
            {Object.entries(entry.attributes).map(([k, v]) => (
              <KV key={k} label={k} value={String(v)} mono />
            ))}
          </div>
        </Section>

        <Section title="Context">
          <div className="space-y-1.5">
            <ContextRow
              level="info"
              text="Webhook delivered to https://hooks.acme.io"
              ts="-1.2s"
            />
            <ContextRow
              level={entry.level}
              text={entry.message}
              ts="0.0s"
              active
            />
            <ContextRow
              level="warn"
              text="Retry attempt 1/5 for upstream=payments-service"
              ts="+0.4s"
            />
            <ContextRow
              level="error"
              text="Stripe charge declined: card_declined for charge ord_…"
              ts="+1.1s"
            />
          </div>
        </Section>
      </div>

      <footer className="flex items-center justify-between gap-2 border-t bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Badge variant="outline" className="h-4 px-1 text-[9px]">
            event.id
          </Badge>
          <span className="font-mono">{entry.id}</span>
        </span>
        <Button variant="ghost" size="xs" className="gap-1">
          Open full record <ExternalLinkIcon />
        </Button>
      </footer>
    </div>
  )
}

function Section({
  title,
  actions,
  children,
}: {
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(true)
  return (
    <section className="border-b">
      <header className="flex items-center justify-between px-3 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
        >
          {open ? (
            <ChevronDownIcon className="size-3" />
          ) : (
            <ChevronRightIcon className="size-3" />
          )}
          {title}
        </button>
        {actions}
      </header>
      {open ? <div className="px-3 pb-3">{children}</div> : null}
    </section>
  )
}

function KV({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-md border bg-card px-2 py-1">
      <div className="text-[9.5px] tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div
        className={cn(
          "truncate text-foreground",
          mono ? "font-mono text-[11px]" : "text-[12px]"
        )}
        title={value}
      >
        {value}
      </div>
    </div>
  )
}

function ContextRow({
  level,
  text,
  ts,
  active,
}: {
  level: LogLevel
  text: string
  ts: string
  active?: boolean
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[44px_8px_1fr] items-baseline gap-2 rounded-md px-2 py-1 font-mono text-[11.5px]",
        active ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/40"
      )}
    >
      <span className="text-right text-muted-foreground tabular-nums">
        {ts}
      </span>
      <span className={cn("h-3 w-1 rounded-sm", LEVEL_BAR[level])} />
      <span className="truncate">{text}</span>
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={() => {
        navigator.clipboard?.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      aria-label="Copy"
    >
      <CopyIcon className={copied ? "text-emerald-500" : undefined} />
    </Button>
  )
}

function buildPayload(entry: LogEntry) {
  return {
    timestamp: entry.timestamp,
    level: entry.level.toUpperCase(),
    thread: "http-bio-8080-exec-1",
    mdc: {
      requestId: `req_${entry.spanId}`,
      tenant: "acme",
    },
    logger: `com.logify.${entry.service}.${
      entry.level === "error" ? "ErrorHandler" : "App"
    }`,
    message: entry.message,
    context: entry.environment,
    ...entry.attributes,
  } as Record<string, unknown>
}

function JsonTree({ data, level = 0 }: { data: unknown; level?: number }) {
  if (data === null) return <span className="text-rose-500">null</span>
  if (typeof data === "string")
    return <span className="text-emerald-500">&quot;{data}&quot;</span>
  if (typeof data === "number")
    return <span className="text-sky-500">{data}</span>
  if (typeof data === "boolean")
    return <span className="text-amber-500">{String(data)}</span>
  if (Array.isArray(data)) {
    return (
      <ol className="ml-3 border-l border-dashed border-border pl-3">
        {data.map((item, i) => (
          <li
            key={i}
            className="flex items-baseline gap-2 font-mono text-[11.5px]"
          >
            <span className="text-muted-foreground tabular-nums">{i}</span>
            <JsonTree data={item} level={level + 1} />
          </li>
        ))}
      </ol>
    )
  }
  if (typeof data === "object") {
    return (
      <ul className={cn(level > 0 ? "ml-3 border-l border-dashed border-border pl-3" : "")}>
        {Object.entries(data as Record<string, unknown>).map(([k, v]) => (
          <li key={k} className="flex items-baseline gap-2 font-mono text-[11.5px]">
            <span className="text-muted-foreground">&quot;{k}&quot;:</span>
            <JsonTree data={v} level={level + 1} />
          </li>
        ))}
      </ul>
    )
  }
  return <span>{String(data)}</span>
}
