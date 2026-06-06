import { Activity, AlertOctagon, Cpu, ServerCog } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { KpiCard } from "@/components/common/kpi-card"
import {
  IncidentStatusBadge,
  SeverityBadge,
  ToneBadge,
} from "@/components/common/status-badge"
import { compactNum, fromNow } from "@/lib/format"
import { incidents, metrics } from "@/lib/mock-data"

const services = [
  { name: "ingest-api", region: "us-east-1", p95: 142, errorRate: 0.21, uptime: 99.98, status: "healthy" },
  { name: "ingest-api", region: "eu-west-1", p95: 412, errorRate: 1.8, uptime: 99.81, status: "degraded" },
  { name: "query-engine", region: "us-east-1", p95: 220, errorRate: 0.4, uptime: 99.95, status: "healthy" },
  { name: "query-engine", region: "ap-south-1", p95: 195, errorRate: 0.3, uptime: 99.97, status: "healthy" },
  { name: "webhooks", region: "global", p95: 85, errorRate: 0.1, uptime: 99.99, status: "healthy" },
  { name: "storage", region: "global", p95: 35, errorRate: 0.05, uptime: 99.99, status: "healthy" },
  { name: "alerting", region: "global", p95: 90, errorRate: 0.12, uptime: 99.98, status: "healthy" },
]

const ingestConfig: ChartConfig = { value: { label: "Ingest", color: "var(--chart-2)" } }
const errorsConfig: ChartConfig = { value: { label: "Errors", color: "var(--chart-1)" } }

export function SystemPage() {
  const openIncidents = incidents.filter((i) => i.status !== "resolved").length
  const avgP95 = Math.round(services.reduce((s, x) => s + x.p95, 0) / services.length)
  const overallUptime = (services.reduce((s, x) => s + x.uptime, 0) / services.length).toFixed(2)

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Uptime (30d)" value={`${overallUptime}%`} delta={0.02} icon={Activity} />
        <KpiCard label="Avg p95" value={`${avgP95} ms`} delta={-3.4} icon={Cpu} hint="lower is better" />
        <KpiCard label="Open incidents" value={openIncidents} icon={AlertOctagon} />
        <KpiCard label="Active services" value={services.length} icon={ServerCog} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingest throughput</CardTitle>
            <CardDescription>GB ingested per day (cluster-wide)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ingestConfig} className="h-56 w-full">
              <AreaChart data={metrics.ingestGbPerDay}>
                <defs>
                  <linearGradient id="sysIngest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="t" tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="value" type="monotone" stroke="var(--color-value)" fill="url(#sysIngest)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error rate</CardTitle>
            <CardDescription>Errors per day (logs.error level)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={errorsConfig} className="h-56 w-full">
              <LineChart data={metrics.errorsPerDay}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="t" tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v) => compactNum.format(v as number)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service health</CardTitle>
          <CardDescription>Live status by region</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">p95</TableHead>
                <TableHead className="text-right">Error %</TableHead>
                <TableHead className="text-right">Uptime 30d</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="font-mono text-xs">{s.region}</TableCell>
                  <TableCell>
                    <ToneBadge tone={s.status === "healthy" ? "success" : "warning"}>
                      {s.status}
                    </ToneBadge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{s.p95} ms</TableCell>
                  <TableCell className="text-right tabular-nums">{s.errorRate}%</TableCell>
                  <TableCell className="text-right tabular-nums">{s.uptime}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incidents</CardTitle>
          <CardDescription>Recent incident activity</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="font-medium">{inc.title}</TableCell>
                  <TableCell className="font-mono text-xs">{inc.service}</TableCell>
                  <TableCell><SeverityBadge severity={inc.severity} /></TableCell>
                  <TableCell><IncidentStatusBadge status={inc.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{fromNow(inc.startedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
