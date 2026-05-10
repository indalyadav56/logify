"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BrainCircuitIcon,
  ChevronRightIcon,
  CircleDotIcon,
  GaugeIcon,
  LightbulbIcon,
  Link2Icon,
  MessageSquarePlusIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  SendIcon,
  SparklesIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

const SPOTLIGHT: {
  id: string
  title: string
  summary: string
  confidence: number
  impacted: string
  traceId: string
} = {
  id: "rca-2841",
  title: "Checkout errors spike correlates with deploy ab12c4f",
  summary:
    "Error rate on checkout-api jumped 18× after deploy ab12c4f at 12:38 UTC. 94% of failing traces share trace pattern T·checkout→payments with timeout on stripe.charge.create. Rollback or increase payments-worker concurrency (currently 4 → recommended 12).",
  confidence: 0.93,
  impacted: "checkout-api, payments-worker, stripe-gateway",
  traceId: "ab12c4d2e8f…",
}

const FINDINGS: {
  id: string
  severity: "critical" | "high" | "medium"
  title: string
  service: string
  time: string
  snippet: string
}[] = [
  {
    id: "F-9012",
    severity: "critical",
    title: "Memory pressure on search-svc pods",
    service: "search-svc",
    time: "8m ago",
    snippet:
      "Heap usage 88% on 3/5 replicas — matches OOM kills in kube 14m ago.",
  },
  {
    id: "F-9011",
    severity: "high",
    title: "Auth token refresh storm",
    service: "auth-edge",
    time: "22m ago",
    snippet:
      "429 rate 12× baseline; correlated with regional us-east-1 edge cache miss.",
  },
  {
    id: "F-9010",
    severity: "medium",
    title: "Slow DB queries on catalog read path",
    service: "media-service",
    time: "1h ago",
    snippet:
      "p95 on SELECT media_asset ↑ 4× — index hint suggests composite (tenant_id, sku).",
  },
]

const ANOMALIES: {
  metric: string
  expected: string
  actual: string
  window: string
}[] = [
  {
    metric: "5xx rate · checkout-api",
    expected: "0.08%",
    actual: "1.44%",
    window: "last 15 min vs baseline 7d",
  },
  {
    metric: "Kafka lag · orders",
    expected: "<2k msgs",
    actual: "18k msgs",
    window: "partition 2",
  },
  {
    metric: "p95 latency · search",
    expected: "120 ms",
    actual: "412 ms",
    window: "last 1h",
  },
]

const RECOMMENDATIONS: { title: string; impact: string; effort: string }[] = [
  {
    title: "Enable tail-based sampling on payments-worker",
    impact: "High — retains 100% error traces with 40% fewer spans",
    effort: "~15 min",
  },
  {
    title: "Add SLO burn alert on checkout checkout_latency_p95",
    impact: "Medium — page before customer-visible slowness",
    effort: "~5 min",
  },
  {
    title: "Tune JVM -Xmx on search-svc from 4G → 6G",
    impact: "High — addresses current heap pressure",
    effort: "Deploy only",
  },
]

export function AiInsightsPage() {
  const [prompt, setPrompt] = React.useState("")

  function runPrompt() {
    if (!prompt.trim()) {
      toast.message("Ask a question first", {
        description: "e.g. Why did errors spike on checkout in the last hour?",
      })
      return
    }
    toast.success("Logify AI is analyzing your signals…", {
      description: "Connect a model backend to stream real answers.",
    })
    setPrompt("")
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/90 px-5 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold tracking-tight">
                AI insights
              </h1>
              <Badge
                variant="outline"
                className="h-5 border-violet-500/30 bg-violet-500/10 text-[10.5px] font-medium text-violet-600 dark:text-violet-300"
              >
                <SparklesIcon className="mr-1 size-3" /> Logify AI
              </Badge>
            </div>
            <p className="mt-1 max-w-2xl text-[12.5px] text-muted-foreground">
              Root-cause suggestions, anomalies, and next actions — grounded in
              your logs, metrics, and traces.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <RefreshCwIcon className="size-3.5" />
              Refresh analysis
            </Button>
            <Button size="sm" className="h-8 gap-1" asChild>
              <Link href="/dashboard/logs">
                <ScrollTextIcon className="size-3.5" />
                Open logs
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-5 py-6">
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20 py-4 pb-4">
            <CardTitle className="flex items-center gap-2 text-[14px] font-semibold">
              <MessageSquarePlusIcon className="size-4 text-violet-500" />
              Ask Logify AI
            </CardTitle>
            <CardDescription className="text-[12.5px]">
              Natural language across your workspace — same data plane as
              Davis-style correlation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Try: "What changed before the 5xx spike on checkout-api?"'
              className="min-h-[88px] resize-y rounded-2xl text-[13px]"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={runPrompt}
              >
                <SendIcon className="size-3.5" />
                Run analysis
              </Button>
              <span className="text-[11px] text-muted-foreground">
                Enter to send soon · Today using mock responses
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-500/20 bg-linear-to-br from-violet-500/5 via-transparent to-emerald-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <BrainCircuitIcon className="size-4 text-violet-500" />
                Spotlight · Root cause
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {Math.round(SPOTLIGHT.confidence * 100)}% confidence
              </Badge>
            </div>
            <CardDescription className="text-[12.5px]">
              Highest-impact finding from the last hour
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[13.5px] font-medium leading-snug text-foreground">
              {SPOTLIGHT.title}
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {SPOTLIGHT.summary}
            </p>
            <div className="flex flex-wrap gap-3 border-t border-border/60 pt-3 text-[11.5px] text-muted-foreground">
              <span>
                <span className="text-foreground/80">Impacted:</span>{" "}
                {SPOTLIGHT.impacted}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="font-mono">
                trace {SPOTLIGHT.traceId}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="default" className="h-8 gap-1">
                View trace waterfall
                <ChevronRightIcon className="size-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Link2Icon className="size-3.5" />
                Link to incident
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="findings" className="w-full gap-4">
          <TabsList variant="line" className="h-auto w-full justify-start rounded-none border-b border-border/60 bg-transparent p-0">
            <TabsTrigger
              value="findings"
              className="rounded-none border-b-2 border-transparent px-3 py-2 text-[13px] data-active:border-primary"
            >
              Findings
            </TabsTrigger>
            <TabsTrigger
              value="anomalies"
              className="rounded-none border-b-2 border-transparent px-3 py-2 text-[13px] data-active:border-primary"
            >
              Anomalies
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="rounded-none border-b-2 border-transparent px-3 py-2 text-[13px] data-active:border-primary"
            >
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="findings" className="mt-0">
            <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
              {FINDINGS.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:gap-4"
                >
                  <SeverityPill severity={f.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[13px] font-medium text-foreground">
                        {f.title}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {f.id}
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">
                      {f.snippet}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono">{f.service}</span>
                      <span>·</span>
                      <span>{f.time}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 self-start gap-0.5 px-2 text-[12px]"
                  >
                    Details
                    <ArrowRightIcon className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="anomalies" className="mt-0">
            <div className="grid gap-3 sm:grid-cols-3">
              {ANOMALIES.map((a) => (
                <Card
                  key={a.metric}
                  size="sm"
                  className="border-border/60"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[12.5px] font-medium leading-snug">
                      {a.metric}
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      {a.window}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-baseline gap-2 pt-0">
                    <span className="text-[11px] text-muted-foreground">
                      Expected
                    </span>
                    <span className="font-mono text-[13px] text-emerald-600 dark:text-emerald-400">
                      {a.expected}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono text-[13px] text-amber-600 dark:text-amber-400">
                      {a.actual}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-0">
            <ul className="space-y-3">
              {RECOMMENDATIONS.map((r) => (
                <li
                  key={r.title}
                  className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <LightbulbIcon className="size-4" />
                    </span>
                    <div>
                      <p className="text-[13px] font-medium">{r.title}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {r.impact}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-11 sm:pl-0">
                    <Badge variant="outline" className="text-[10px]">
                      {r.effort}
                    </Badge>
                    <Button size="sm" className="h-8">
                      Apply
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <MiniStat
            icon={TrendingUpIcon}
            label="Noise reduced"
            value="38%"
            hint="vs last week — similar alerts grouped"
          />
          <MiniStat
            icon={GaugeIcon}
            label="Queries auto-suggested"
            value="214"
            hint="saved by operators this month"
          />
          <MiniStat
            icon={ZapIcon}
            label="MTTR delta"
            value="−18 min"
            hint="median for Sev1 incidents"
          />
        </div>

        <Separator className="bg-border/60" />

        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 text-[11.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CircleDotIcon className="size-3 text-emerald-500" />
            Model: Logify AI · Last full scan 2 min ago
          </span>
          <Link
            href="#"
            className="text-foreground underline-offset-4 hover:underline"
          >
            AI data handling & privacy
          </Link>
        </div>
      </div>
    </div>
  )
}

function SeverityPill({
  severity,
}: Readonly<{
  severity: (typeof FINDINGS)[number]["severity"]
}>) {
  const styles = {
    critical:
      "bg-destructive/15 text-destructive border-destructive/25",
    high: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    medium:
      "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 w-fit shrink-0 border font-medium capitalize",
        styles[severity]
      )}
    >
      <AlertTriangleIcon className="mr-1 size-3" />
      {severity}
    </Badge>
  )
}

function MiniStat(
  props: Readonly<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
    hint: string
  }>
) {
  const { icon: Icon, label, value, hint } = props
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <Icon className="size-3.5 text-primary" />
        {label}
      </div>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}
