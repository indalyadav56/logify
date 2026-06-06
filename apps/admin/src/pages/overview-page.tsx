import { Link } from "react-router-dom"
import {
  Users,
  Building2,
  DollarSign,
  Database,
  TrendingUp,
  AlertOctagon,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Button } from "@/components/ui/button"

import { KpiCard } from "@/components/common/kpi-card"
import {
  IncidentStatusBadge,
  PlanBadge,
  SeverityBadge,
} from "@/components/common/status-badge"
import { compactNum, fromNow, usd } from "@/lib/format"
import {
  incidents,
  metrics,
  organizations,
  overviewKpis,
} from "@/lib/mock-data"

const ingestConfig: ChartConfig = {
  value: { label: "Ingest (GB)", color: "var(--chart-2)" },
}
const eventsConfig: ChartConfig = {
  value: { label: "Events", color: "var(--chart-1)" },
}
const mrrConfig: ChartConfig = {
  value: { label: "MRR (USD)", color: "var(--chart-3)" },
}

export function OverviewPage() {
  const k = overviewKpis()
  const topOrgs = [...organizations]
    .sort((a, b) => b.mrr - a.mrr)
    .slice(0, 6)

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="MRR" value={usd.format(k.mrr)} delta={4.8} icon={DollarSign} hint="vs last month" />
        <KpiCard label="Organizations" value={k.totalOrgs} delta={2.1} icon={Building2} hint={`${k.trialOrgs} on trial`} />
        <KpiCard label="Active users" value={k.activeUsers} delta={6.3} icon={Users} hint={`of ${k.totalUsers}`} />
        <KpiCard label="Ingest (30d)" value={`${k.ingest} GB`} delta={-1.2} icon={Database} hint="rolling" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ingest volume</CardTitle>
              <CardDescription>Daily GB ingested across all tenants</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/system">Details</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ingestConfig} className="h-64 w-full">
              <AreaChart data={metrics.ingestGbPerDay}>
                <defs>
                  <linearGradient id="ingestGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="t"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area
                  dataKey="value"
                  type="monotone"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  fill="url(#ingestGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open incidents</CardTitle>
            <CardDescription>{k.openIncidents} active</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {incidents.map((inc) => (
              <div key={inc.id} className="grid gap-1 rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium leading-snug">{inc.title}</div>
                  <SeverityBadge severity={inc.severity} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <AlertOctagon className="size-3" /> {inc.service}
                  </span>
                  <IncidentStatusBadge status={inc.status} />
                </div>
                <div className="text-xs text-muted-foreground">{fromNow(inc.startedAt)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Events processed</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={eventsConfig} className="h-56 w-full">
              <BarChart data={metrics.eventsPerDay}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="t" tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tickLine={false} axisLine={false} width={42} tickFormatter={(v) => compactNum.format(v as number)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>MRR trend</CardTitle>
              <CardDescription>Last 12 months</CardDescription>
            </div>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ChartContainer config={mrrConfig} className="h-56 w-full">
              <LineChart data={metrics.mrrPerMonth}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="t" tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `$${compactNum.format(v as number)}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top organizations by MRR</CardTitle>
            <CardDescription>Highest revenue this month</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/organizations">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Seats</TableHead>
                <TableHead className="text-right">Ingest</TableHead>
                <TableHead className="text-right">MRR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topOrgs.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link to={`/organizations/${o.id}`} className="font-medium hover:underline">
                      {o.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{o.slug}</div>
                  </TableCell>
                  <TableCell>
                    <PlanBadge plan={o.plan} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {o.seatsUsed}/{o.seats}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {o.monthlyIngestGb.toFixed(1)} GB
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {usd.format(o.mrr)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
