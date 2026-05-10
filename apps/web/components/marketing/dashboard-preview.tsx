import * as React from "react"

import { cn } from "@/lib/utils"

type LogRow = {
  time: string
  level: "INFO" | "WARN" | "ERROR" | "DEBUG"
  service: string
  message: string
}

const ROWS: LogRow[] = [
  {
    time: "12:42:18.812",
    level: "INFO",
    service: "checkout-api",
    message: "POST /v1/orders 201 in 84ms user_id=u_8K3 trace_id=ab12…",
  },
  {
    time: "12:42:18.804",
    level: "DEBUG",
    service: "payments-worker",
    message: "stripe.charge.captured amount=$129.00 currency=usd",
  },
  {
    time: "12:42:18.793",
    level: "WARN",
    service: "search-svc",
    message: "elastic query slow took=412ms index=catalog-prod",
  },
  {
    time: "12:42:18.781",
    level: "INFO",
    service: "auth-edge",
    message: "session.refresh ok user_id=u_8K3 ip=10.0.4.12",
  },
  {
    time: "12:42:18.770",
    level: "ERROR",
    service: "checkout-api",
    message:
      "Unhandled exception: NullPointerException at OrderHandler:142 trace_id=ab12…",
  },
  {
    time: "12:42:18.762",
    level: "INFO",
    service: "frontend-ssr",
    message: "GET /products/sku-9931 200 in 38ms region=us-east-1",
  },
  {
    time: "12:42:18.750",
    level: "DEBUG",
    service: "kafka-bridge",
    message: "consumed topic=orders partition=2 offset=98214 lag=12",
  },
  {
    time: "12:42:18.741",
    level: "INFO",
    service: "billing-cron",
    message: "invoice.generated tenant=acme amount=$1,204.50",
  },
]

const FACETS: { label: string; values: { name: string; count: string }[] }[] = [
  {
    label: "Status",
    values: [
      { name: "info", count: "1.2M" },
      { name: "warn", count: "182k" },
      { name: "error", count: "9,412" },
      { name: "debug", count: "612k" },
    ],
  },
  {
    label: "Service",
    values: [
      { name: "checkout-api", count: "612k" },
      { name: "auth-edge", count: "418k" },
      { name: "search-svc", count: "201k" },
      { name: "payments-worker", count: "184k" },
    ],
  },
  {
    label: "Environment",
    values: [
      { name: "production", count: "2.4M" },
      { name: "staging", count: "118k" },
    ],
  },
]

const LEVEL_STYLES: Record<LogRow["level"], string> = {
  INFO: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
  WARN: "text-amber-300 bg-amber-500/10 ring-amber-500/20",
  ERROR: "text-rose-300 bg-rose-500/10 ring-rose-500/20",
  DEBUG: "text-sky-300 bg-sky-500/10 ring-sky-500/20",
}

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.18_0.008_44)] shadow-2xl shadow-black/40 ring-1 ring-white/5",
        className
      )}
    >
      <BrowserChrome />

      <div className="grid grid-cols-12 border-t border-white/10">
        <FacetsColumn />
        <MainColumn />
      </div>
    </div>
  )
}

function BrowserChrome() {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 bg-[oklch(0.165_0.007_44)] px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-rose-500/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-500/70" />
      </div>
      <div className="mx-auto flex h-6 w-full max-w-md items-center justify-center gap-1.5 rounded-md bg-black/30 px-3 text-[11px] font-mono text-white/50">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        app.logify.io/dashboard/logs?env=production
      </div>
      <div className="hidden items-center gap-1 sm:flex">
        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/60">
          ⌘K
        </span>
      </div>
    </div>
  )
}

function FacetsColumn() {
  return (
    <aside className="col-span-12 hidden border-r border-white/10 bg-black/15 p-4 lg:col-span-3 lg:block">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">
          Facets
        </span>
        <span className="text-[10px] text-white/40">3 active</span>
      </div>
      <div className="space-y-5">
        {FACETS.map((g) => (
          <div key={g.label}>
            <div className="mb-1.5 text-[11px] font-medium text-white/70">
              {g.label}
            </div>
            <ul className="space-y-1">
              {g.values.map((v, idx) => (
                <li
                  key={v.name}
                  className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[12px] text-white/80 hover:bg-white/5"
                >
                  <span
                    className={cn(
                      "inline-block size-3 rounded-sm border border-white/20",
                      idx === 0 ? "bg-emerald-500/70" : "bg-transparent"
                    )}
                  />
                  <span className="truncate font-mono text-[11.5px]">
                    {v.name}
                  </span>
                  <span className="ml-auto text-[10.5px] text-white/40">
                    {v.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}

function MainColumn() {
  return (
    <div className="col-span-12 flex min-w-0 flex-col lg:col-span-9">
      <QueryBar />
      <Histogram />
      <LogList />
    </div>
  )
}

function QueryBar() {
  return (
    <div className="border-b border-white/10 bg-black/10 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 font-mono text-[12px] text-white/80">
          <span className="text-emerald-400">service:checkout-api</span>
          <span className="text-white/30">AND</span>
          <span className="text-amber-300">level:error</span>
          <span className="text-white/30">|</span>
          <span className="text-sky-300">trace_id:ab12*</span>
          <span className="ml-auto inline-block h-3 w-px animate-pulse bg-emerald-400" />
        </div>
        <div className="flex h-8 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 text-[11.5px] font-medium text-white/70">
          Last 15m
        </div>
        <div className="hidden h-8 items-center gap-1 rounded-md bg-emerald-500/90 px-3 text-[11.5px] font-medium text-emerald-950 sm:flex">
          Run
        </div>
      </div>
    </div>
  )
}

const HISTOGRAM_BARS = [
  6, 9, 14, 11, 18, 22, 16, 19, 27, 33, 28, 24, 31, 38, 44, 36, 29, 41, 52, 47,
  39, 33, 28, 24, 31, 38, 45, 53, 60, 57, 49, 42, 36, 31, 28, 25, 33, 41, 49,
  55, 62, 70, 64, 58, 51, 47, 43, 49,
]

function Histogram() {
  const max = Math.max(...HISTOGRAM_BARS)
  return (
    <div className="border-b border-white/10 bg-black/10 px-3 pt-3 pb-2">
      <div className="mb-2 flex items-baseline justify-between">
        <div className="flex items-center gap-2 text-[11px] text-white/60">
          <span>2,841,209 events</span>
          <span className="text-white/30">·</span>
          <span className="text-emerald-400">live</span>
        </div>
        <div className="flex items-center gap-3 text-[10.5px] text-white/50">
          <Legend color="bg-emerald-500" label="info" />
          <Legend color="bg-sky-500" label="debug" />
          <Legend color="bg-amber-400" label="warn" />
          <Legend color="bg-rose-500" label="error" />
        </div>
      </div>
      <div className="flex h-[68px] items-end gap-[3px]">
        {HISTOGRAM_BARS.map((v, i) => {
          const h = Math.max(6, (v / max) * 100)
          const isErr = i === 12 || i === 30 || i === 41
          return (
            <div
              key={i}
              className="relative flex-1 overflow-hidden rounded-t-[2px]"
              style={{ height: `${h}%` }}
            >
              <div className="absolute inset-x-0 bottom-0 h-[55%] bg-emerald-500/80" />
              <div className="absolute inset-x-0 bottom-[55%] h-[20%] bg-sky-500/70" />
              <div className="absolute inset-x-0 bottom-[75%] h-[15%] bg-amber-400/80" />
              <div
                className={cn(
                  "absolute inset-x-0 bottom-[90%] h-[10%]",
                  isErr ? "bg-rose-500" : "bg-rose-500/60"
                )}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("size-1.5 rounded-full", color)} />
      {label}
    </span>
  )
}

function LogList() {
  return (
    <div className="font-mono text-[11.5px] leading-5 text-white/85">
      <div className="grid grid-cols-[140px_64px_140px_1fr] gap-x-3 border-b border-white/10 bg-black/15 px-3 py-1.5 text-[10.5px] font-semibold tracking-wider text-white/50 uppercase">
        <span>Timestamp</span>
        <span>Level</span>
        <span>Service</span>
        <span>Message</span>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {ROWS.map((r, i) => (
          <li
            key={i}
            className={cn(
              "grid grid-cols-[140px_64px_140px_1fr] items-center gap-x-3 px-3 py-1.5",
              r.level === "ERROR" && "bg-rose-500/[0.06]"
            )}
          >
            <span className="truncate text-white/55">{r.time}</span>
            <span>
              <span
                className={cn(
                  "inline-flex items-center rounded px-1.5 text-[10px] font-semibold tracking-wide ring-1 ring-inset",
                  LEVEL_STYLES[r.level]
                )}
              >
                {r.level}
              </span>
            </span>
            <span className="truncate text-white/70">{r.service}</span>
            <span className="truncate text-white/85">{r.message}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-1.5 text-[10.5px] text-white/45">
        <span className="inline-flex size-1.5 animate-pulse rounded-full bg-emerald-400" />
        Streaming · 8,412 events/s · 47ms p95 ingest latency
      </div>
    </div>
  )
}
