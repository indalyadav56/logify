export type BillingInterval = "monthly" | "annual"

export type BillingPlan = {
  id: string
  name: string
  /** Monthly price in USD; `null` for custom (Enterprise). */
  priceMonthly: number | null
  tagline: string
  features: string[]
  popular?: boolean
}

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled"

export type Subscription = {
  planId: string
  status: SubscriptionStatus
  interval: BillingInterval
  seats: number
  /** ISO date the current period renews / trial ends. */
  currentPeriodEnd: string
  /** ISO date the trial ends, when status is "trialing". */
  trialEndsAt?: string
}

export type UsageMetric = {
  id: string
  label: string
  used: number
  limit: number
  unit: string
  hint?: string
}

export type PaymentMethod = {
  brand: string
  last4: string
  expMonth: number
  expYear: number
  name: string
}

export type Invoice = {
  id: string
  number: string
  date: string
  amount: number
  status: "paid" | "open" | "void"
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 0,
    tagline: "For side projects that still deserve real telemetry.",
    features: [
      "5 GB logs / month",
      "7-day retention",
      "1 seat",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 29,
    tagline: "For teams shipping to production every day.",
    popular: true,
    features: [
      "Usage-based log ingestion",
      "30-day retention",
      "Up to 25 seats",
      "Logify AI · RCA",
      "SSO / SAML & audit log",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: null,
    tagline: "For regulated and global SRE organizations.",
    features: [
      "Volume pricing & BYOK",
      "13-month retention",
      "Unlimited seats",
      "Custom SLA · 24/7 support",
      "Dedicated solution architect",
    ],
  },
]

export function getPlan(planId: string): BillingPlan | undefined {
  return BILLING_PLANS.find((p) => p.id === planId)
}

export const MOCK_SUBSCRIPTION: Subscription = {
  planId: "pro",
  status: "trialing",
  interval: "monthly",
  seats: 8,
  currentPeriodEnd: "2026-07-06T00:00:00Z",
  trialEndsAt: "2026-07-06T00:00:00Z",
}

export const MOCK_USAGE: UsageMetric[] = [
  {
    id: "logs",
    label: "Log ingestion",
    used: 1840,
    limit: 2048,
    unit: "GB",
    hint: "Resets at the end of the billing period.",
  },
  {
    id: "metrics",
    label: "Metric series",
    used: 820_000,
    limit: 1_000_000,
    unit: "series",
  },
  {
    id: "seats",
    label: "Team seats",
    used: 8,
    limit: 25,
    unit: "seats",
  },
  {
    id: "retention",
    label: "Retention",
    used: 30,
    limit: 30,
    unit: "days",
    hint: "Upgrade to Enterprise for up to 13 months.",
  },
]

export const MOCK_PAYMENT_METHOD: PaymentMethod = {
  brand: "Visa",
  last4: "4242",
  expMonth: 8,
  expYear: 2028,
  name: "Indal Kumar",
}

export const MOCK_INVOICES: Invoice[] = [
  { id: "in_006", number: "LOGIFY-2026-006", date: "2026-06-01T00:00:00Z", amount: 232.0, status: "paid" },
  { id: "in_005", number: "LOGIFY-2026-005", date: "2026-05-01T00:00:00Z", amount: 232.0, status: "paid" },
  { id: "in_004", number: "LOGIFY-2026-004", date: "2026-04-01T00:00:00Z", amount: 203.5, status: "paid" },
  { id: "in_003", number: "LOGIFY-2026-003", date: "2026-03-01T00:00:00Z", amount: 203.5, status: "paid" },
  { id: "in_002", number: "LOGIFY-2026-002", date: "2026-02-01T00:00:00Z", amount: 174.0, status: "paid" },
]

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatCurrency(amount: number): string {
  return USD.format(amount)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
