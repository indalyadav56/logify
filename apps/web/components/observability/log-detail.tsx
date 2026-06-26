"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  PinIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { LOG_LEVEL_INDICATOR } from "@/lib/log-levels"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LogLevelBadge } from "@/components/observability/log-level-badge"
import { type LogEntry } from "@/lib/mock-data"

export function LogDetail({
  entry,
  onClose,
}: {
  entry: LogEntry
  onClose: () => void
}) {
  const ts = new Date(entry.timestamp)
  const iso = ts.toISOString()

  return (
    <div className="flex h-full min-w-[min(100%,380px)] max-w-full flex-col bg-background">
      <header className="shrink-0 space-y-3 border-b border-border bg-card px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-1.5 size-2.5 shrink-0 rounded-full ring-2 ring-background",
              LOG_LEVEL_INDICATOR[entry.level]
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-[15px] font-semibold leading-tight tracking-tight text-foreground">
                {entry.service}
              </h2>
              <LogLevelBadge
                level={entry.level}
                className="h-6 min-w-0 shrink-0 px-2 text-[10px]"
              />
            </div>
            <div className="tabular-nums-lining flex flex-col gap-0.5 text-[12px] leading-snug text-muted-foreground sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
              <time dateTime={iso} className="text-foreground/80">
                {ts.toLocaleString([], { hour12: false })}
                <span className="text-muted-foreground">
                  .{ts.getMilliseconds().toString().padStart(3, "0")}
                </span>
              </time>
              <Separator
                orientation="vertical"
                className="hidden h-3 self-center sm:block"
              />
              <span className="truncate" title={entry.host}>
                {entry.host}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                  aria-label="Pin panel"
                >
                  <PinIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Pin panel
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <XIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Close
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="pb-2">
          <Section
            title="Message"
            description="Full log line text"
            actions={<CopyButton value={entry.message} label="message" />}
          >
            <div className="rounded-md border border-border bg-muted/30">
              <div className="px-3.5 py-3.5 sm:px-4 sm:py-4">
                <p className="wrap-break-word font-code text-[12px] leading-relaxed tracking-tight text-foreground/90">
                  {entry.message}
                </p>
              </div>
            </div>
          </Section>

          <Section title="Payload" description="Structured log fields">
            <Tabs defaultValue="json" className="w-full gap-0">
              <TabsList
                variant="default"
                className="h-9 w-full justify-stretch gap-0.5 rounded-lg bg-muted/60 p-1 shadow-inner"
              >
                <TabsTrigger
                  value="json"
                  className="flex-1 rounded-md text-[12px] font-medium transition-all duration-150"
                >
                  JSON
                </TabsTrigger>
                <TabsTrigger
                  value="raw"
                  className="flex-1 rounded-md text-[12px] font-medium transition-all duration-150"
                >
                  Raw
                </TabsTrigger>
                <TabsTrigger
                  value="formatted"
                  className="flex-1 rounded-md text-[12px] font-medium transition-all duration-150"
                >
                  Fields
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="json"
                className="mt-4 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-200"
              >
                <div className="overflow-hidden rounded-md border border-border bg-background">
                  <ScrollArea className="h-[min(22rem,42vh)]">
                    <div className="p-4 pr-2">
                      <JsonTree data={buildPayload(entry)} />
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              <TabsContent
                value="raw"
                className="mt-4 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-200"
              >
                <div className="overflow-hidden rounded-md border border-border bg-muted/25">
                  <ScrollArea className="h-[min(22rem,42vh)]">
                    <pre className="whitespace-pre-wrap p-4 pr-2 font-code text-[11.5px] leading-relaxed text-foreground/90">
                      {`${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.service} (host=${entry.host}) trace=${entry.traceId} span=${entry.spanId}\n  ${entry.message}`}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
              <TabsContent
                value="formatted"
                className="mt-4 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-200"
              >
                <div className="rounded-md border border-border bg-card p-1">
                  <dl className="divide-y divide-border/50">
                    {Object.entries(buildPayload(entry)).map(([k, v]) => (
                      <div
                        key={k}
                        className="grid gap-1 px-3 py-2.5 sm:grid-cols-[minmax(7rem,9rem)_1fr] sm:gap-4"
                      >
                        <dt className="font-sans text-[11px] font-medium tracking-wide text-muted-foreground">
                          {k}
                        </dt>
                        <dd className="min-w-0 font-code text-[12px] leading-snug text-foreground/90 break-all">
                          {typeof v === "object"
                            ? JSON.stringify(v)
                            : String(v)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </TabsContent>
            </Tabs>
          </Section>
        </div>
      </ScrollArea>

      <footer className="shrink-0 border-t border-border bg-muted/20 px-4 py-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="h-5 shrink-0 px-2 font-sans text-[10px] font-medium"
            >
              event id
            </Badge>
            <code className="truncate font-code text-[11px] text-muted-foreground">
              {entry.id}
            </code>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5 text-[12px] font-medium transition-colors duration-150"
          >
            Open full record
            <ExternalLinkIcon className="size-3.5 opacity-70" />
          </Button>
        </div>
      </footer>
    </div>
  )
}

function Section({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(true)

  return (
    <section className="border-b border-border last:border-b-0">
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="group/section flex min-w-0 flex-1 items-start gap-2.5 rounded-md py-1 text-left transition-colors duration-150 hover:bg-muted/40"
          >
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted/30 text-muted-foreground transition-[background-color,border-color] duration-150 group-hover/section:border-border group-hover/section:bg-muted/50">
              {open ? (
                <ChevronDownIcon className="size-3.5" />
              ) : (
                <ChevronRightIcon className="size-3.5" />
              )}
            </span>
            <span className="min-w-0 pt-0.5">
              <span className="block text-sm font-semibold leading-tight tracking-tight text-foreground">
                {title}
              </span>
              {description ? (
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {description}
                </span>
              ) : null}
            </span>
          </button>
          {actions ? (
            <div className="shrink-0 pt-0.5 [&_button]:transition-colors [&_button]:duration-150">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-4 pt-3">{children}</div>
        </div>
      </div>
    </section>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(id)
  }, [copied])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "size-8 rounded-md text-muted-foreground transition-[color,transform] duration-150 hover:bg-muted hover:text-foreground",
            copied && "text-primary"
          )}
          onClick={() => {
            void navigator.clipboard?.writeText(value)
            setCopied(true)
          }}
          aria-label={copied ? "Copied" : `Copy ${label}`}
        >
          {copied ? (
            <CheckIcon className="size-4 text-primary" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs">
        {copied ? "Copied" : `Copy ${label}`}
      </TooltipContent>
    </Tooltip>
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

function JsonTree({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null)
    return (
      <span className="font-code text-[12px] text-muted-foreground italic">
        null
      </span>
    )
  if (typeof data === "string")
    return (
      <span className="font-code text-[12px] text-primary">
        &quot;{data}&quot;
      </span>
    )
  if (typeof data === "number")
    return (
      <span className="font-code text-[12px] text-sky-700 tabular-nums dark:text-sky-400/90">
        {data}
      </span>
    )
  if (typeof data === "boolean")
    return (
      <span className="font-code text-[12px] text-amber-700 dark:text-amber-400/90">
        {String(data)}
      </span>
    )
  if (Array.isArray(data)) {
    return (
      <ol className="space-y-1.5 border-l border-dashed border-border/60 pl-3">
        {data.map((item, i) => (
          <li
            key={i}
            className="flex items-baseline gap-2.5 font-code text-[12px] leading-6"
          >
            <span className="w-5 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
              {i}
            </span>
            <JsonTree data={item} depth={depth + 1} />
          </li>
        ))}
      </ol>
    )
  }
  if (typeof data === "object") {
    return (
      <ul
        className={cn(
          "space-y-1.5",
          depth > 0 && "ml-0.5 border-l border-dashed border-border/50 pl-3"
        )}
      >
        {Object.entries(data as Record<string, unknown>).map(([k, v]) => (
          <li
            key={k}
            className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2"
          >
            <span className="shrink-0 font-code text-[12px] text-foreground/75">
              &quot;{k}&quot;
              <span className="text-muted-foreground/80">:</span>
            </span>
            <span className="min-w-0 flex-1">
              <JsonTree data={v} depth={depth + 1} />
            </span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <span className="font-code text-[12px] text-foreground/80">
      {String(data)}
    </span>
  )
}
