export type UserStatus = "active" | "invited" | "suspended"
export type UserRole = "owner" | "admin" | "member" | "viewer"

export type User = {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  status: UserStatus
  organizationId: string
  lastActiveAt: string
  createdAt: string
}

export type OrgPlan = "free" | "starter" | "growth" | "enterprise"
export type OrgStatus = "active" | "trial" | "past_due" | "cancelled"

export type Organization = {
  id: string
  name: string
  slug: string
  plan: OrgPlan
  status: OrgStatus
  seats: number
  seatsUsed: number
  monthlyIngestGb: number
  monthlyIngestQuotaGb: number
  mrr: number
  createdAt: string
}

export type Project = {
  id: string
  name: string
  organizationId: string
  environment: "production" | "staging" | "development"
  ingestRate: number
  errorRate: number
  retentionDays: number
  createdAt: string
}

export type AuditAction =
  | "user.invite"
  | "user.suspend"
  | "user.delete"
  | "org.plan_change"
  | "org.suspend"
  | "project.create"
  | "project.delete"
  | "billing.refund"
  | "auth.login"

export type AuditLog = {
  id: string
  actorId: string
  actorEmail: string
  action: AuditAction
  target: string
  ip: string
  createdAt: string
}

export type Invoice = {
  id: string
  organizationId: string
  amount: number
  status: "paid" | "open" | "void" | "failed"
  issuedAt: string
}

export type Incident = {
  id: string
  title: string
  severity: "low" | "medium" | "high" | "critical"
  status: "investigating" | "identified" | "monitoring" | "resolved"
  startedAt: string
  service: string
}

const ORG_NAMES = [
  "Acme Corp",
  "Globex",
  "Initech",
  "Umbrella",
  "Hooli",
  "Wonka Industries",
  "Stark Industries",
  "Wayne Enterprises",
  "Cyberdyne",
  "Soylent",
  "Massive Dynamic",
  "Tyrell Corp",
  "Pied Piper",
  "Vandelay",
  "Dunder Mifflin",
]

const FIRST = [
  "Aanya",
  "Rohan",
  "Maya",
  "Arjun",
  "Priya",
  "Vikram",
  "Anika",
  "Kabir",
  "Ishita",
  "Aditya",
  "Diya",
  "Ayaan",
  "Sara",
  "Reyansh",
  "Zara",
  "Veer",
  "Lara",
  "Noah",
  "Liam",
  "Olivia",
  "Emma",
  "Ava",
  "Sophia",
  "Mia",
  "Lucas",
  "Mason",
]
const LAST = [
  "Sharma",
  "Khan",
  "Patel",
  "Singh",
  "Mehta",
  "Reddy",
  "Iyer",
  "Das",
  "Roy",
  "Bose",
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Davis",
  "Garcia",
  "Lopez",
  "Wilson",
]

const PLANS: OrgPlan[] = ["free", "starter", "growth", "enterprise"]
const ROLES: UserRole[] = ["owner", "admin", "member", "viewer"]

// Tiny seeded RNG so the mock data is stable across reloads.
function mulberry32(seed: number) {
  let s = seed
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(1729)
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]!
const intBetween = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1))
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
const minutesAgo = (n: number) =>
  new Date(Date.now() - n * 60 * 1000).toISOString()

function planQuota(plan: OrgPlan) {
  return plan === "free"
    ? 5
    : plan === "starter"
      ? 50
      : plan === "growth"
        ? 500
        : 5000
}
function planMrr(plan: OrgPlan, seats: number) {
  const perSeat = plan === "free" ? 0 : plan === "starter" ? 29 : plan === "growth" ? 79 : 249
  return seats * perSeat
}

export const organizations: Organization[] = ORG_NAMES.map((name, i) => {
  const plan = i === 0 ? "enterprise" : PLANS[i % PLANS.length]!
  const seats = intBetween(3, 60)
  const seatsUsed = Math.max(1, seats - intBetween(0, 8))
  const quota = planQuota(plan)
  const ingest = +(rand() * quota * 1.1).toFixed(1)
  const status: OrgStatus = i === 4 ? "past_due" : i === 9 ? "trial" : "active"
  return {
    id: `org_${i + 1}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    plan,
    status,
    seats,
    seatsUsed,
    monthlyIngestGb: ingest,
    monthlyIngestQuotaGb: quota,
    mrr: planMrr(plan, seatsUsed),
    createdAt: daysAgo(intBetween(30, 720)),
  }
})

export const users: User[] = Array.from({ length: 64 }, (_, i) => {
  const first = pick(FIRST)
  const last = pick(LAST)
  const org = pick(organizations)
  const role: UserRole = i % 17 === 0 ? "owner" : ROLES[(i % 4)]!
  const status: UserStatus =
    i % 23 === 0 ? "suspended" : i % 11 === 0 ? "invited" : "active"
  return {
    id: `user_${i + 1}`,
    name: `${first} ${last}`,
    email: `${first}.${last}`.toLowerCase() + `@${org.slug}.com`,
    role,
    status,
    organizationId: org.id,
    lastActiveAt: minutesAgo(intBetween(1, 60 * 24 * 14)),
    createdAt: daysAgo(intBetween(1, 365)),
  }
})

export const projects: Project[] = organizations.flatMap((org) =>
  Array.from({ length: intBetween(1, 4) }, (_, j) => {
    const env =
      j === 0
        ? "production"
        : j === 1
          ? "staging"
          : (["development", "staging"] as const)[intBetween(0, 1)]!
    const ingest = +(rand() * 2000 + 50).toFixed(0)
    return {
      id: `proj_${org.id}_${j + 1}`,
      name: `${org.slug}-${env === "production" ? "api" : env === "staging" ? "stg" : "dev"}`,
      organizationId: org.id,
      environment: env,
      ingestRate: ingest,
      errorRate: +(rand() * 5).toFixed(2),
      retentionDays: pick([7, 14, 30, 60, 90]),
      createdAt: daysAgo(intBetween(7, 365)),
    }
  })
)

const ACTIONS: AuditAction[] = [
  "user.invite",
  "user.suspend",
  "user.delete",
  "org.plan_change",
  "org.suspend",
  "project.create",
  "project.delete",
  "billing.refund",
  "auth.login",
]

export const auditLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => {
  const actor = pick(users.filter((u) => u.role === "admin" || u.role === "owner"))
  return {
    id: `audit_${i + 1}`,
    actorId: actor.id,
    actorEmail: actor.email,
    action: pick(ACTIONS),
    target: pick([...organizations.map((o) => o.name), ...users.slice(0, 20).map((u) => u.email)]),
    ip: `${intBetween(10, 240)}.${intBetween(0, 255)}.${intBetween(0, 255)}.${intBetween(1, 254)}`,
    createdAt: minutesAgo(intBetween(1, 60 * 24 * 30)),
  }
})

export const invoices: Invoice[] = organizations.flatMap((org) =>
  Array.from({ length: 4 }, (_, m) => ({
    id: `inv_${org.id}_${m}`,
    organizationId: org.id,
    amount: org.mrr,
    status: m === 0 && org.status === "past_due" ? "failed" : ("paid" as const),
    issuedAt: daysAgo(m * 30 + 1),
  }))
)

export const incidents: Incident[] = [
  {
    id: "inc_1",
    title: "Elevated ingest latency in eu-west-1",
    severity: "high",
    status: "monitoring",
    service: "ingest-api",
    startedAt: minutesAgo(45),
  },
  {
    id: "inc_2",
    title: "Search queries returning partial results",
    severity: "medium",
    status: "investigating",
    service: "query-engine",
    startedAt: minutesAgo(120),
  },
  {
    id: "inc_3",
    title: "Webhook delivery delays",
    severity: "low",
    status: "resolved",
    service: "webhooks",
    startedAt: minutesAgo(60 * 8),
  },
]

export type SeriesPoint = { t: string; value: number }

function series(days: number, base: number, jitter: number, trend = 0) {
  return Array.from({ length: days }, (_, i) => {
    const noise = (rand() - 0.5) * jitter
    return {
      t: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      value: Math.max(0, Math.round(base + trend * i + noise)),
    }
  })
}

export const metrics = {
  ingestGbPerDay: series(30, 320, 80, 4),
  eventsPerDay: series(30, 1_800_000, 350_000, 12_000),
  activeUsersPerDay: series(30, 480, 80, 3),
  errorsPerDay: series(30, 4200, 1500, -30),
  newOrgsPerDay: series(30, 4, 4, 0.05),
  mrrPerMonth: series(12, 28_000, 4000, 800),
}

export const overviewKpis = () => {
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === "active").length
  const totalOrgs = organizations.length
  const trialOrgs = organizations.filter((o) => o.status === "trial").length
  const mrr = organizations.reduce((sum, o) => sum + o.mrr, 0)
  const ingest = organizations.reduce((sum, o) => sum + o.monthlyIngestGb, 0)
  return {
    totalUsers,
    activeUsers,
    totalOrgs,
    trialOrgs,
    mrr,
    ingest: +ingest.toFixed(1),
    openIncidents: incidents.filter((i) => i.status !== "resolved").length,
  }
}
