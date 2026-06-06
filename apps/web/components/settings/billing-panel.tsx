"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CreditCardIcon,
  DownloadIcon,
  InfoIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SettingsSection } from "@/components/settings/settings-section"
import {
  BILLING_PLANS,
  MOCK_INVOICES,
  MOCK_PAYMENT_METHOD,
  MOCK_SUBSCRIPTION,
  MOCK_USAGE,
  formatCurrency,
  formatDate,
  getPlan,
  type BillingInterval,
} from "@/lib/settings/billing-data"

export function BillingPanel() {
  const [interval, setInterval] = React.useState<BillingInterval>("monthly")
  const plan = getPlan(MOCK_SUBSCRIPTION.planId)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <CurrentPlanSection interval={interval} setInterval={setInterval} />
      <UsageSection />
      <PaymentMethodSection />
      <InvoicesSection />
    </div>
  )
}

function CurrentPlanSection({
  interval,
  setInterval,
}: {
  interval: BillingInterval
  setInterval: (v: BillingInterval) => void
}) {
  const sub = MOCK_SUBSCRIPTION
  const activePlan = getPlan(sub.planId)

  return (
    <SettingsSection
      title="Plan"
      description="Manage your subscription and compare plans."
      action={
        <div className="flex items-center gap-1 rounded-full border border-border bg-muted/40 p-0.5">
          {(["monthly", "annual"] as const).map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setInterval(iv)}
              className={cn(
                "rounded-full px-3 py-1 text-[11.5px] font-medium transition-colors",
                interval === iv
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {iv === "monthly" ? "Monthly" : "Annual · 20% off"}
            </button>
          ))}
        </div>
      }
    >
      {sub.status === "trialing" && sub.trialEndsAt ? (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/8 px-4 py-3">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground">
              Trial ends {formatDate(sub.trialEndsAt)}
            </p>
            <p className="text-[12px] text-muted-foreground">
              Add a payment method to keep access after your trial. No charge until then.
            </p>
          </div>
          <Button size="sm" className="ml-auto h-8 shrink-0 gap-1.5 text-[12px]">
            Add card
          </Button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {BILLING_PLANS.map((p) => {
          const isActive = p.id === sub.planId
          return (
            <div
              key={p.id}
              className={cn(
                "relative flex flex-col rounded-lg border p-4 transition-colors",
                isActive
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/60 bg-card hover:border-border"
              )}
            >
              {p.popular && !isActive ? (
                <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <SparklesIcon className="size-2.5" /> Popular
                </span>
              ) : null}
              {isActive ? (
                <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <CheckIcon className="size-2.5" /> Current plan
                </span>
              ) : null}

              <p className="text-[14px] font-semibold text-foreground">{p.name}</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                {p.tagline}
              </p>

              <div className="mt-3 mb-4">
                {p.priceMonthly === null ? (
                  <span className="text-[22px] font-bold tracking-tight text-foreground">
                    Custom
                  </span>
                ) : (
                  <span className="flex items-end gap-1">
                    <span className="text-[22px] font-bold tracking-tight text-foreground">
                      {formatCurrency(
                        interval === "annual"
                          ? Math.round(p.priceMonthly * 0.8)
                          : p.priceMonthly
                      )}
                    </span>
                    {p.priceMonthly > 0 ? (
                      <span className="mb-1 text-[12px] text-muted-foreground">/mo</span>
                    ) : (
                      <span className="mb-1 text-[12px] text-muted-foreground">free</span>
                    )}
                  </span>
                )}
              </div>

              <ul className="mb-5 flex flex-col gap-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                    <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {isActive ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full text-[12px]"
                    onClick={() => toast.info("Manage your subscription in the customer portal.")}
                  >
                    Manage
                  </Button>
                ) : p.priceMonthly === null ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full gap-1.5 text-[12px]"
                    onClick={() => toast.info("Our sales team will reach out shortly.")}
                  >
                    Contact sales <ArrowUpRightIcon className="size-3" />
                  </Button>
                ) : p.priceMonthly === 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full text-[12px] text-muted-foreground"
                    onClick={() => toast.info("Downgrade scheduled for end of billing period.")}
                  >
                    Downgrade
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 w-full gap-1.5 text-[12px]"
                    onClick={() => toast.success(`Upgrading to ${p.name}…`)}
                  >
                    <ZapIcon className="size-3" /> Upgrade
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </SettingsSection>
  )
}

function UsageSection() {
  return (
    <SettingsSection
      title="Usage"
      description="Current billing period usage. Resets on the next renewal date."
    >
      <div className="flex flex-col gap-4">
        {MOCK_USAGE.map((metric) => {
          const pct = Math.min(100, Math.round((metric.used / metric.limit) * 100))
          const critical = pct >= 90
          const warning = pct >= 70 && !critical

          return (
            <div key={metric.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] font-medium text-foreground truncate">
                    {metric.label}
                  </span>
                  {metric.hint ? (
                    <span
                      title={metric.hint}
                      className="cursor-default"
                    >
                      <InfoIcon className="size-3.5 text-muted-foreground/60" />
                    </span>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "shrink-0 text-[12px] tabular-nums",
                    critical
                      ? "font-semibold text-destructive"
                      : warning
                        ? "font-semibold text-amber-500"
                        : "text-muted-foreground"
                  )}
                >
                  {metric.used.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={pct}
                  className={cn(
                    "h-2",
                    critical
                      ? "[&>div]:bg-destructive"
                      : warning
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-primary"
                  )}
                />
              </div>
              {critical ? (
                <p className="text-[11.5px] text-destructive">
                  {pct === 100
                    ? "Limit reached. Upgrade to avoid service interruption."
                    : `${100 - pct}% remaining — approaching your limit.`}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </SettingsSection>
  )
}

function PaymentMethodSection() {
  const pm = MOCK_PAYMENT_METHOD
  return (
    <SettingsSection
      title="Payment method"
      description="Your default payment method for all invoices."
      action={
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[12px]"
          onClick={() => toast.info("Redirecting to payment portal…")}
        >
          Update
        </Button>
      }
    >
      <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
          <CreditCardIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-foreground">
            {pm.brand} ending in {pm.last4}
          </p>
          <p className="text-[12px] text-muted-foreground">
            Expires {pm.expMonth.toString().padStart(2, "0")} / {pm.expYear} · {pm.name}
          </p>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-primary/30 bg-primary/8 text-[11px] text-primary"
        >
          Default
        </Badge>
      </div>
    </SettingsSection>
  )
}

function InvoicesSection() {
  return (
    <SettingsSection
      title="Invoices"
      description="Billing history for the last 12 months."
    >
      <div className="overflow-hidden rounded-md border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-[11.5px] font-semibold text-muted-foreground">
                Invoice
              </TableHead>
              <TableHead className="text-[11.5px] font-semibold text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="text-[11.5px] font-semibold text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="text-[11.5px] font-semibold text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_INVOICES.map((inv) => (
              <TableRow key={inv.id} className="text-[13px]">
                <TableCell className="font-mono text-[12px] text-foreground">
                  {inv.number}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(inv.date)}
                </TableCell>
                <TableCell className="tabular-nums font-medium text-foreground">
                  {formatCurrency(inv.amount)}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={inv.status} />
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    aria-label="Download invoice"
                    onClick={() => toast.info(`Downloading ${inv.number}…`)}
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <DownloadIcon className="size-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SettingsSection>
  )
}

function InvoiceStatusBadge({ status }: { status: "paid" | "open" | "void" }) {
  if (status === "paid") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400"
      >
        Paid
      </Badge>
    )
  }
  if (status === "open") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-600 dark:text-amber-400"
      >
        Open
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-[11px] text-muted-foreground">
      Void
    </Badge>
  )
}
