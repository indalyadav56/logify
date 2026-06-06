import { CreditCard, DollarSign, TrendingUp, Wallet } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { PlanBadge } from "@/components/common/status-badge"
import { compactNum, fmtDate, usd } from "@/lib/format"
import { invoices, metrics, organizations } from "@/lib/mock-data"

const mrrConfig: ChartConfig = { value: { label: "MRR", color: "var(--chart-3)" } }
const PLAN_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

export function BillingPage() {
  const totalMrr = organizations.reduce((sum, o) => sum + o.mrr, 0)
  const arr = totalMrr * 12
  const failed = invoices.filter((i) => i.status === "failed")
  const open = invoices.filter((i) => i.status === "paid").slice(0, 8)

  const planBreakdown = ["free", "starter", "growth", "enterprise"].map((plan) => ({
    plan,
    mrr: organizations.filter((o) => o.plan === plan).reduce((s, o) => s + o.mrr, 0),
    count: organizations.filter((o) => o.plan === plan).length,
  }))
  const planConfig: ChartConfig = Object.fromEntries(
    planBreakdown.map((p, i) => [p.plan, { label: p.plan, color: PLAN_COLORS[i] }])
  )

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="MRR" value={usd.format(totalMrr)} delta={5.4} icon={DollarSign} hint="vs last month" />
        <KpiCard label="ARR" value={usd.format(arr)} delta={5.4} icon={TrendingUp} />
        <KpiCard label="Open invoices" value={open.length} icon={Wallet} />
        <KpiCard label="Failed" value={failed.length} icon={CreditCard} delta={failed.length ? 100 : 0} hint="this cycle" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>MRR — last 12 months</CardTitle>
            <CardDescription>Aggregated monthly recurring revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={mrrConfig} className="h-64 w-full">
              <BarChart data={metrics.mrrPerMonth}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="t" tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(v) => `$${compactNum.format(v as number)}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by plan</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={planConfig} className="mx-auto h-56 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="plan" />} />
                <Pie data={planBreakdown} dataKey="mrr" nameKey="plan" innerRadius={50} outerRadius={80} isAnimationActive={false}>
                  {planBreakdown.map((_, i) => (
                    <Cell key={i} fill={PLAN_COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 grid gap-1.5">
              {planBreakdown.map((p, i) => (
                <div key={p.plan} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-sm" style={{ background: PLAN_COLORS[i] }} />
                    <span className="capitalize">{p.plan}</span>
                    <span className="text-muted-foreground">({p.count})</span>
                  </span>
                  <span className="font-medium tabular-nums">{usd.format(p.mrr)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent invoices</CardTitle>
          <CardDescription>Across all organizations.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.slice(0, 20).map((inv) => {
                const org = organizations.find((o) => o.id === inv.organizationId)
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                    <TableCell>{org?.name ?? "—"}</TableCell>
                    <TableCell>{org && <PlanBadge plan={org.plan} />}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(inv.issuedAt)}</TableCell>
                    <TableCell className="capitalize">
                      <span
                        className={
                          inv.status === "paid"
                            ? "text-emerald-600"
                            : inv.status === "failed"
                              ? "text-rose-600"
                              : "text-muted-foreground"
                        }
                      >
                        {inv.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{usd.format(inv.amount)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
