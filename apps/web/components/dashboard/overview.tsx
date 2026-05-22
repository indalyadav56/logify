"use client"

import * as React from "react"
import Link from "next/link"
import {
  ActivityIcon,
  ArrowDownRightIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BellRingIcon,
  CheckCircle2Icon,
  CircleDotIcon,
  ClockIcon,
  DatabaseIcon,
  FlameIcon,
  GaugeIcon,
  GitCommitHorizontalIcon,
  ScrollTextIcon,
  ServerIcon,
  ZapIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Trend = "up" | "down" | "flat"

type Kpi = {
  label: string
  value: string
  unit?: string
  delta: string
  trend: Trend
  spark: number[]
  icon: React.ComponentType<{ className?: string }>
  good: "up" | "down"
}

const KPIS: Kpi[] = [
  {
    label: "Logs ingested",
    value: "284.1",
    unit: "M / 24h",
    delta: "+12.4%",
    trend: "up",
    spark: [22, 28, 24, 33, 38, 41, 47, 52, 49, 55, 61, 68, 64, 72, 79, 84],
    icon: ScrollTextIcon,
    good: "up",
  },
  {
    label: "Active services",
    value: "127",
    delta: "+3 this week",
    trend: "up",
    spark: [120, 121, 122, 122, 123, 124, 124, 125, 125, 126, 126, 127],
    icon: ServerIcon,
    good: "up",
  },
  {
    label: "Open alerts",
    value: "9",
    delta: "−2 since yesterday",
    trend: "down",
    spark: [14, 13, 12, 12, 11, 12, 11, 10, 10, 9, 9, 9],
    icon: BellRingIcon,
    good: "down",
  },
  {
    label: "p95 query latency",
    value: "47",
    unit: "ms",
    delta: "−9 ms",
    trend: "down",
    spark: [62, 58, 60, 56, 53, 55, 51, 49, 50, 48, 47, 47],
    icon: GaugeIcon,
    good: "down",
  },
]

export function DashboardOverview() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <PageHeader />

      <div className="flex flex-col gap-5 px-5 pb-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <IngestionPanel className="lg:col-span-2" />
          <RecentAlerts />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <ServicesHealth className="lg:col-span-2" />
          <RecentDeploys />
        </div>
      </div>
    </div>
  )
}

function PageHeader() {
  return (
    <div className="sticky top-0 z-10 border-b border-border/60 bg-background/85 px-5 py-4 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">
            Welcome back, Avery
          </h1>
          <p className="text-[12.5px] text-muted-foreground">
            Here&apos;s what&apos;s happening across your fleet right now.
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge
            variant="outline"
            className="h-6 gap-1.5 border-border/60 bg-background"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-[11px] font-medium text-muted-foreground">
              Live · 8.4k ev/s
            </span>
          </Badge>
          <Button asChild size="sm" variant="outline" className="h-8">
            <Link href="/dashboard/logs">
              <ScrollTextIcon className="size-3.5" /> Open Logs
            </Link>
          </Button>
          <Button size="sm" className="h-8">
            <ZapIcon className="size-3.5" /> Run query
          </Button>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon
  const positive =
    (kpi.trend === "up" && kpi.good === "up") ||
    (kpi.trend === "down" && kpi.good === "down")
  const TrendIcon =
    kpi.trend === "up"
      ? ArrowUpRightIcon
      : kpi.trend === "down"
        ? ArrowDownRightIcon
        : ArrowRightIcon

  return (
    <div className="group/kpi relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border">
      <div className="flex items-center justify-between">
        <div className="inline-flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-3.5" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
            positive
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-rose-500/10 text-rose-500"
          )}
        >
          <TrendIcon className="size-3" />
          {kpi.delta}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-heading text-2xl tracking-tight tabular-nums">
          {kpi.value}
        </span>
        {kpi.unit ? (
          <span className="text-[11.5px] text-muted-foreground">
            {kpi.unit}
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 text-[12px] text-muted-foreground">{kpi.label}</p>

      <Spark values={kpi.spark} positive={positive} className="mt-3 h-9" />
    </div>
  )
}

function Spark({
  values,
  positive,
  className,
}: {
  values: number[]
  positive: boolean
  className?: string
}) {
  const w = 200
  const h = 36
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const step = w / (values.length - 1)
  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ")
  const area = `M0,${h} L${points} L${w},${h} Z`
  const stroke = positive ? "stroke-emerald-500" : "stroke-rose-500"
  const fill = positive ? "fill-emerald-500/15" : "fill-rose-500/15"
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      aria-hidden
    >
      <path d={area} className={fill} />
      <polyline
        points={points}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={stroke}
      />
    </svg>
  )
}

const INGEST_BARS = [
  18, 22, 28, 24, 31, 38, 44, 36, 29, 41, 52, 47, 39, 33, 28, 24, 31, 38, 45,
  53, 60, 57, 49, 42, 36, 31, 28, 25, 33, 41, 49, 55, 62, 70, 64, 58, 51, 47,
  43, 49, 55, 64, 72, 81, 76, 68, 61, 58,
]

function IngestionPanel({ className }: { className?: string }) {
  const max = Math.max(...INGEST_BARS)
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border/60 bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div>
          <h2 className="text-[13.5px] font-semibold tracking-tight">
            Ingestion volume
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Last 24 hours · all services
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Legend color="bg-emerald-500" label="info" />
          <Legend color="bg-sky-500" label="debug" />
          <Legend color="bg-amber-400" label="warn" />
          <Legend color="bg-rose-500" label="error" />
        </div>
      </div>
      <div className="flex flex-1 items-end gap-[3px] px-4 pt-4 pb-3">
        {INGEST_BARS.map((v, i) => {
          const h = Math.max(8, (v / max) * 100)
          const errSpike = i === 14 || i === 31 || i === 42
          return (
            <div
              key={i}
              className="relative flex-1 overflow-hidden rounded-t-[2px]"
              style={{ height: `${h}%` }}
            >
              <div className="absolute inset-x-0 bottom-0 h-[58%] bg-emerald-500/80" />
              <div className="absolute inset-x-0 bottom-[58%] h-[20%] bg-sky-500/70" />
              <div className="absolute inset-x-0 bottom-[78%] h-[14%] bg-amber-400/80" />
              <div
                className={cn(
                  "absolute inset-x-0 bottom-[92%] h-[8%]",
                  errSpike ? "bg-rose-500" : "bg-rose-500/60"
                )}
              />
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 border-t border-border/60 px-4 py-2.5 text-[11.5px] text-muted-foreground">
        <Stat label="Total" value="284.1M" />
        <Stat label="Errors" value="9.4k" highlight="text-rose-400" />
        <Stat label="Warns" value="182k" highlight="text-amber-400" />
        <Stat label="p95 ingest" value="47 ms" />
        <span className="ml-auto inline-flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          live
        </span>
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

function Stat({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: string
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-muted-foreground/70">{label}</span>
      <span
        className={cn(
          "font-mono text-[12px] font-semibold text-foreground",
          highlight
        )}
      >
        {value}
      </span>
    </span>
  )
}

const ALERTS: {
  id: string
  title: string
  service: string
  severity: "critical" | "high" | "warn"
  age: string
}[] = [
  {
    id: "AL-3812",
    title: "Error rate > 2% on /v1/orders",
    service: "checkout-api",
    severity: "critical",
    age: "4m",
  },
  {
    id: "AL-3811",
    title: "p99 latency above SLO",
    service: "search-svc",
    severity: "high",
    age: "12m",
  },
  {
    id: "AL-3810",
    title: "Kafka consumer lag rising",
    service: "kafka-bridge",
    severity: "warn",
    age: "37m",
  },
  {
    id: "AL-3809",
    title: "Disk usage > 85%",
    service: "ch-coordinator",
    severity: "warn",
    age: "1h",
  },
  {
    id: "AL-3808",
    title: "5xx spike on auth-edge",
    service: "auth-edge",
    severity: "high",
    age: "2h",
  },
]

const SEVERITY_STYLES: Record<
  (typeof ALERTS)[number]["severity"],
  { dot: string; text: string }
> = {
  critical: { dot: "bg-rose-500", text: "text-rose-400" },
  high: { dot: "bg-amber-400", text: "text-amber-400" },
  warn: { dot: "bg-sky-400", text: "text-sky-400" },
}

function RecentAlerts() {
  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <h2 className="text-[13.5px] font-semibold tracking-tight">
            Open alerts
          </h2>
          <p className="text-[12px] text-muted-foreground">
            5 firing · 2 acknowledged
          </p>
        </div>
        <Button asChild variant="ghost" size="xs" className="h-6 gap-1">
          <Link href="#">
            View all <ArrowRightIcon className="size-3" />
          </Link>
        </Button>
      </div>

      <ul className="divide-y divide-border/60">
        {ALERTS.map((a) => {
          const s = SEVERITY_STYLES[a.severity]
          return (
            <li
              key={a.id}
              className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40"
            >
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  s.dot
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">
                  {a.title}
                </p>
                <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                  <span className="font-mono">{a.service}</span> ·{" "}
                  <span className={cn("font-medium uppercase", s.text)}>
                    {a.severity}
                  </span>{" "}
                  · {a.id}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 self-center text-[11px] text-muted-foreground">
                <ClockIcon className="size-3" />
                {a.age}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const SERVICES: {
  name: string
  language: string
  rps: string
  errRate: number
  latency: number
  health: "healthy" | "degraded" | "warning"
}[] = [
  {
    name: "checkout-api",
    language: "Node.js",
    rps: "12.4k",
    errRate: 2.1,
    latency: 184,
    health: "warning",
  },
  {
    name: "auth-edge",
    language: "Go",
    rps: "9.1k",
    errRate: 0.04,
    latency: 27,
    health: "healthy",
  },
  {
    name: "search-svc",
    language: "Java",
    rps: "5.7k",
    errRate: 0.31,
    latency: 412,
    health: "degraded",
  },
  {
    name: "payments-worker",
    language: "Go",
    rps: "3.2k",
    errRate: 0.02,
    latency: 64,
    health: "healthy",
  },
  {
    name: "kafka-bridge",
    language: "Rust",
    rps: "44k ev/s",
    errRate: 0,
    latency: 8,
    health: "healthy",
  },
  {
    name: "frontend-ssr",
    language: "Node.js",
    rps: "18.0k",
    errRate: 0.12,
    latency: 38,
    health: "healthy",
  },
]

const HEALTH_STYLES: Record<
  (typeof SERVICES)[number]["health"],
  { dot: string; label: string; text: string }
> = {
  healthy: { dot: "bg-emerald-500", label: "Healthy", text: "text-emerald-400" },
  degraded: { dot: "bg-amber-400", label: "Degraded", text: "text-amber-400" },
  warning: { dot: "bg-rose-500", label: "Warning", text: "text-rose-400" },
}

function ServicesHealth({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border/60 bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <h2 className="text-[13.5px] font-semibold tracking-tight">
            Service health
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Top services by request volume
          </p>
        </div>
        <Button asChild variant="ghost" size="xs" className="h-6 gap-1">
          <Link href="#">
            Service catalog <ArrowRightIcon className="size-3" />
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-[10.5px] font-semibold tracking-wider text-muted-foreground uppercase">
              <th className="px-4 py-2 text-left font-semibold">Service</th>
              <th className="px-2 py-2 text-left font-semibold">Status</th>
              <th className="px-2 py-2 text-right font-semibold">Requests</th>
              <th className="px-2 py-2 text-right font-semibold">Errors</th>
              <th className="px-2 py-2 text-right font-semibold">p95</th>
              <th className="px-4 py-2 text-right font-semibold">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {SERVICES.map((s) => {
              const style = HEALTH_STYLES[s.health]
              const errBad = s.errRate >= 1
              return (
                <tr key={s.name} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <DatabaseIcon className="size-3.5 text-muted-foreground" />
                      <span className="font-mono text-[12.5px] font-medium text-foreground">
                        {s.name}
                      </span>
                      <span className="text-[10.5px] text-muted-foreground">
                        {s.language}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11.5px] font-medium",
                        style.text
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", style.dot)} />
                      {style.label}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono tabular-nums text-foreground">
                    {s.rps}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2.5 text-right font-mono tabular-nums",
                      errBad ? "text-rose-400" : "text-muted-foreground"
                    )}
                  >
                    {s.errRate.toFixed(2)}%
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {s.latency} ms
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Spark
                      values={[
                        4,
                        5,
                        4,
                        6,
                        7,
                        6,
                        8,
                        9,
                        7,
                        10,
                        8,
                        9,
                        11,
                        10,
                        12,
                      ]}
                      positive={s.health === "healthy"}
                      className="ml-auto h-5 w-20"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const DEPLOYS: {
  service: string
  sha: string
  message: string
  author: string
  status: "ok" | "rollback" | "running"
  ago: string
}[] = [
  {
    service: "checkout-api",
    sha: "ab12c4f",
    message: "fix(orders): retry idempotent payment captures",
    author: "Avery",
    status: "running",
    ago: "2m",
  },
  {
    service: "auth-edge",
    sha: "9ee0a1d",
    message: "perf: switch session store to ristretto",
    author: "Priya",
    status: "ok",
    ago: "47m",
  },
  {
    service: "search-svc",
    sha: "73d19a2",
    message: "feat: facet aggregations behind flag",
    author: "Marco",
    status: "ok",
    ago: "1h",
  },
  {
    service: "frontend-ssr",
    sha: "6f0bb8e",
    message: "ui: redesign landing & pricing",
    author: "Avery",
    status: "rollback",
    ago: "3h",
  },
]

const DEPLOY_STATUS: Record<
  (typeof DEPLOYS)[number]["status"],
  { icon: React.ComponentType<{ className?: string }>; tone: string; label: string }
> = {
  ok: { icon: CheckCircle2Icon, tone: "text-emerald-500", label: "Healthy" },
  running: { icon: CircleDotIcon, tone: "text-sky-400", label: "In progress" },
  rollback: { icon: FlameIcon, tone: "text-rose-500", label: "Rolled back" },
}

function RecentDeploys() {
  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <h2 className="text-[13.5px] font-semibold tracking-tight">
            Recent deploys
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Correlated with current alerts
          </p>
        </div>
        <Button asChild variant="ghost" size="xs" className="h-6 gap-1">
          <Link href="#">
            History <ArrowRightIcon className="size-3" />
          </Link>
        </Button>
      </div>
      <ul className="divide-y divide-border/60">
        {DEPLOYS.map((d) => {
          const s = DEPLOY_STATUS[d.status]
          const Icon = s.icon
          return (
            <li
              key={d.sha}
              className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40"
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", s.tone)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">
                  {d.message}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11.5px] text-muted-foreground">
                  <span className="font-mono">{d.service}</span>
                  <GitCommitHorizontalIcon className="size-3" />
                  <span className="font-mono">{d.sha}</span>
                  <span>·</span>
                  <span>{d.author}</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1 self-center text-[11px] text-muted-foreground">
                <ActivityIcon className="size-3" />
                {d.ago}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
