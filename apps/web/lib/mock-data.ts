export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal"

export type LogEntry = {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  host: string
  environment: "production" | "staging" | "development"
  message: string
  traceId: string
  spanId: string
  attributes: Record<string, string | number | boolean>
}

export type ServiceHealth = "healthy" | "degraded" | "down" | "warning"

export type Service = {
  id: string
  name: string
  language: "Node.js" | "Go" | "Python" | "Java" | "Rust" | "Ruby" | ".NET"
  environment: "production" | "staging" | "development"
  health: ServiceHealth
  requestsPerMin: number
  errorRate: number
  p95Latency: number
  apdex: number
  instances: number
  owner: string
  version: string
  lastDeployed: string
}

export type Trace = {
  id: string
  rootService: string
  rootOperation: string
  durationMs: number
  spans: number
  status: "ok" | "error"
  startedAt: string
  services: string[]
  errorRate: number
}

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info"
export type AlertStatus = "firing" | "acknowledged" | "resolved"

export type Alert = {
  id: string
  title: string
  service: string
  severity: AlertSeverity
  status: AlertStatus
  message: string
  triggeredAt: string
  metric: string
  threshold: string
  value: string
  assignee?: string
}

export type AlertRule = {
  id: string
  name: string
  enabled: boolean
  metric: string
  condition: string
  scope: string
  channels: string[]
  severity: AlertSeverity
  triggered24h: number
}

export type MetricPoint = {
  time: string
  value: number
}

export type SeriesPoint = {
  time: string
  api: number
  web: number
  worker: number
  mobile: number
}

const SERVICE_NAMES = [
  "api-gateway",
  "auth-service",
  "payments-service",
  "checkout-service",
  "search-service",
  "notification-service",
  "inventory-service",
  "user-service",
  "billing-service",
  "analytics-pipeline",
  "media-service",
  "recommendation-engine",
] as const

const HOSTS = [
  "ip-10-0-1-12",
  "ip-10-0-1-44",
  "ip-10-0-2-31",
  "ip-10-0-2-87",
  "ip-10-0-3-19",
  "ip-10-0-3-202",
  "ip-10-0-4-77",
]

const LOG_TEMPLATES: Record<LogLevel, string[]> = {
  trace: [
    "Entering function processOrder({orderId})",
    "Cache lookup for key={key} resulted in MISS",
    "DB connection pool size={n}",
  ],
  debug: [
    "Building query: SELECT * FROM orders WHERE id = {orderId}",
    "Decoded JWT for user={userId} (exp in {sec}s)",
    "Resolved feature flag {flag} -> {bool}",
  ],
  info: [
    "Request handled in {ms}ms status=200 path=/v1/orders",
    "Order {orderId} confirmed for user {userId}",
    "Scheduled job {job} completed successfully",
    "User {userId} signed in from {ip}",
    "Webhook delivered to https://hooks.{tenant}.io",
  ],
  warn: [
    "Slow query detected: 1.{ms}s on table=orders",
    "Retry attempt {n}/5 for upstream={service}",
    "Rate limit nearing for tenant={tenant} ({pct}% used)",
    "Deprecated API /v1/legacy called by user-agent={ua}",
  ],
  error: [
    "Upstream call failed: connect ECONNREFUSED {service}:443",
    "Database query timed out after 5000ms",
    "Failed to decode payload: unexpected token at position {n}",
    "Stripe charge declined: card_declined for charge {orderId}",
    "Unhandled rejection at processOrder: TypeError: Cannot read 'lineItems' of undefined",
  ],
  fatal: [
    "OOM killer terminated worker pid={n}",
    "Process exiting after uncaughtException: heap out of memory",
    "Health check failing on /readyz for {service}",
  ],
}

const ENVIRONMENTS: LogEntry["environment"][] = [
  "production",
  "staging",
  "development",
]

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = t
    r = Math.imul(r ^ (r >>> 15), r | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function template(rng: () => number, str: string) {
  return str
    .replace(/\{orderId\}/g, () => `ord_${Math.floor(rng() * 9_000_000) + 1_000_000}`)
    .replace(/\{userId\}/g, () => `usr_${Math.floor(rng() * 90_000) + 10_000}`)
    .replace(/\{ip\}/g, () => `${Math.floor(rng() * 223) + 1}.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}`)
    .replace(/\{ms\}/g, () => `${Math.floor(rng() * 1900) + 100}`)
    .replace(/\{sec\}/g, () => `${Math.floor(rng() * 1800) + 60}`)
    .replace(/\{n\}/g, () => `${Math.floor(rng() * 50)}`)
    .replace(/\{pct\}/g, () => `${Math.floor(rng() * 30) + 70}`)
    .replace(/\{key\}/g, () => `cache:user:${Math.floor(rng() * 90_000) + 10_000}`)
    .replace(/\{flag\}/g, () => pick(rng, ["new_checkout", "ai_search", "fast_lane", "beta_dashboard"]))
    .replace(/\{bool\}/g, () => (rng() > 0.5 ? "true" : "false"))
    .replace(/\{job\}/g, () => pick(rng, ["billing.cron", "metrics.rollup", "session.cleanup"]))
    .replace(/\{service\}/g, () => pick(rng, SERVICE_NAMES))
    .replace(/\{tenant\}/g, () => pick(rng, ["acme", "globex", "initech", "hooli", "stark"]))
    .replace(/\{ua\}/g, () => pick(rng, ["curl/8.4", "okhttp/4.10", "axios/1.6", "Mozilla/5.0"]))
}

// Stable reference time so SSR and client render identical mock data
// (avoids React hydration mismatches in timestamps and ids derived from now).
const REFERENCE_NOW = new Date("2026-05-10T10:30:00Z").getTime()

export function generateLogs(count = 220, seed = 42): LogEntry[] {
  const rng = mulberry32(seed)
  const now = REFERENCE_NOW
  const logs: LogEntry[] = []

  const levelDistribution: LogLevel[] = [
    ...Array(8).fill("info"),
    ...Array(5).fill("debug"),
    ...Array(2).fill("trace"),
    ...Array(4).fill("warn"),
    ...Array(3).fill("error"),
    ...Array(1).fill("fatal"),
  ] as LogLevel[]

  for (let i = 0; i < count; i++) {
    const level = pick(rng, levelDistribution)
    const service = pick(rng, SERVICE_NAMES)
    const host = pick(rng, HOSTS)
    const env = pick(rng, ENVIRONMENTS)
    const tpl = pick(rng, LOG_TEMPLATES[level])

    logs.push({
      id: `log_${i}_${Math.floor(rng() * 1_000_000)}`,
      timestamp: new Date(
        now - Math.floor(rng() * 1000 * 60 * 60 * 6)
      ).toISOString(),
      level,
      service,
      host,
      environment: env,
      message: template(rng, tpl),
      traceId: Math.floor(rng() * 1e16).toString(16).padStart(16, "0"),
      spanId: Math.floor(rng() * 1e16).toString(16).padStart(16, "0").slice(0, 8),
      attributes: {
        region: pick(rng, ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"]),
        version: `${Math.floor(rng() * 4) + 1}.${Math.floor(rng() * 12)}.${Math.floor(rng() * 30)}`,
        latency_ms: Math.floor(rng() * 1500),
        retry: Math.floor(rng() * 3),
      },
    })
  }

  return logs.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

export const logs = generateLogs()

const LANGUAGES: Service["language"][] = [
  "Node.js",
  "Go",
  "Python",
  "Java",
  "Rust",
  "Ruby",
  ".NET",
]

const HEALTH: ServiceHealth[] = [
  "healthy",
  "healthy",
  "healthy",
  "warning",
  "degraded",
  "down",
]

const OWNERS = [
  "Platform",
  "Payments",
  "Growth",
  "Identity",
  "Search",
  "Data",
  "Mobile",
  "Infra",
]

export function generateServices(seed = 7): Service[] {
  const rng = mulberry32(seed)
  return SERVICE_NAMES.map((name, i) => {
    const health = pick(rng, HEALTH)
    return {
      id: `svc_${i + 1}`,
      name,
      language: pick(rng, LANGUAGES),
      environment: "production",
      health,
      requestsPerMin: Math.floor(rng() * 9000) + 200,
      errorRate:
        health === "down"
          ? rng() * 12 + 8
          : health === "degraded"
            ? rng() * 5 + 3
            : health === "warning"
              ? rng() * 2 + 0.8
              : rng() * 0.5,
      p95Latency:
        health === "down"
          ? Math.floor(rng() * 800) + 1200
          : health === "degraded"
            ? Math.floor(rng() * 500) + 600
            : Math.floor(rng() * 250) + 60,
      apdex:
        health === "down"
          ? 0.3 + rng() * 0.2
          : health === "degraded"
            ? 0.55 + rng() * 0.15
            : 0.85 + rng() * 0.14,
      instances: Math.floor(rng() * 18) + 2,
      owner: pick(rng, OWNERS),
      version: `${Math.floor(rng() * 4) + 1}.${Math.floor(rng() * 24)}.${Math.floor(rng() * 30)}`,
      lastDeployed: new Date(
        Date.now() - Math.floor(rng() * 1000 * 60 * 60 * 24 * 12)
      ).toISOString(),
    }
  })
}

export const services = generateServices()

const TRACE_OPERATIONS = [
  "POST /v1/checkout",
  "GET /v1/products/{id}",
  "POST /v1/payments/charge",
  "GET /v1/users/me",
  "POST /v1/auth/login",
  "GET /v1/search",
  "POST /v1/notifications/send",
  "GET /v1/inventory/{sku}",
  "POST /v1/billing/invoice",
  "GET /v1/recommendations",
]

export function generateTraces(count = 30, seed = 13): Trace[] {
  const rng = mulberry32(seed)
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const isError = rng() < 0.18
    const spans = Math.floor(rng() * 28) + 4
    const involved = Array.from(
      new Set(
        Array.from({ length: Math.floor(rng() * 5) + 2 }, () =>
          pick(rng, SERVICE_NAMES)
        )
      )
    )
    return {
      id: Math.floor(rng() * 1e16).toString(16).padStart(16, "0"),
      rootService: involved[0],
      rootOperation: pick(rng, TRACE_OPERATIONS),
      durationMs: isError
        ? Math.floor(rng() * 2500) + 800
        : Math.floor(rng() * 850) + 40,
      spans,
      status: isError ? "error" : "ok",
      startedAt: new Date(
        now - Math.floor(rng() * 1000 * 60 * 30)
      ).toISOString(),
      services: involved,
      errorRate: isError ? rng() * 35 + 10 : rng() * 1.2,
    } satisfies Trace
  }).sort(
    (a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )
}

export const traces = generateTraces()

export function generateAlerts(seed = 99): Alert[] {
  const rng = mulberry32(seed)

  const seed1: Omit<Alert, "id" | "triggeredAt">[] = [
    {
      title: "High error rate on payments-service",
      service: "payments-service",
      severity: "critical",
      status: "firing",
      message: "Error rate 12.4% over last 5m exceeds threshold 2%",
      metric: "service.error_rate",
      threshold: "> 2%",
      value: "12.4%",
      assignee: "Maria K.",
    },
    {
      title: "p95 latency degraded — checkout-service",
      service: "checkout-service",
      severity: "high",
      status: "firing",
      message: "p95 latency 1.42s vs SLO 500ms for 8m",
      metric: "http.server.p95",
      threshold: "> 500ms",
      value: "1.42s",
      assignee: "Jamal R.",
    },
    {
      title: "OOM kills on analytics-pipeline pods",
      service: "analytics-pipeline",
      severity: "high",
      status: "acknowledged",
      message: "3 pods restarted with OOMKilled in last 10m",
      metric: "k8s.pod.oom_killed",
      threshold: "> 0 in 10m",
      value: "3",
      assignee: "Pria S.",
    },
    {
      title: "Auth login failure spike",
      service: "auth-service",
      severity: "medium",
      status: "firing",
      message: "Login failures up 240% vs 7d baseline",
      metric: "auth.login.failure",
      threshold: "+200% baseline",
      value: "+240%",
    },
    {
      title: "DB connection pool saturating",
      service: "user-service",
      severity: "medium",
      status: "acknowledged",
      message: "Pool utilization 94% sustained over 15m",
      metric: "db.pool.utilization",
      threshold: "> 90%",
      value: "94%",
      assignee: "Devon T.",
    },
    {
      title: "Cron job billing.invoice missed",
      service: "billing-service",
      severity: "low",
      status: "firing",
      message: "Scheduled run did not execute in last 65m",
      metric: "scheduler.last_run",
      threshold: "< 60m ago",
      value: "65m ago",
    },
    {
      title: "5xx response anomaly detected",
      service: "search-service",
      severity: "medium",
      status: "resolved",
      message: "Anomaly model flagged 5xx burst, auto-resolved after 4m",
      metric: "http.server.5xx",
      threshold: "anomaly z>3",
      value: "z=4.1",
    },
    {
      title: "Disk usage > 85% on host ip-10-0-3-19",
      service: "infra",
      severity: "low",
      status: "resolved",
      message: "Disk reclaimed by log rotation",
      metric: "host.disk.used_pct",
      threshold: "> 85%",
      value: "73%",
    },
    {
      title: "Synthetic check failed: /healthz",
      service: "api-gateway",
      severity: "high",
      status: "resolved",
      message: "2 of 5 regions failed health probe for 3m",
      metric: "synthetic.healthz",
      threshold: "fail rate > 20%",
      value: "40%",
      assignee: "Lin Z.",
    },
  ]

  return seed1.map((a, i) => ({
    ...a,
    id: `alt_${i + 1}`,
    triggeredAt: new Date(
      Date.now() - Math.floor(rng() * 1000 * 60 * 90)
    ).toISOString(),
  }))
}

export const alerts = generateAlerts()

export const alertRules: AlertRule[] = [
  {
    id: "rule_1",
    name: "API error rate > 2%",
    enabled: true,
    metric: "service.error_rate",
    condition: "avg(5m) > 2",
    scope: "service:api-gateway env:production",
    channels: ["#oncall-platform", "PagerDuty: Platform"],
    severity: "critical",
    triggered24h: 4,
  },
  {
    id: "rule_2",
    name: "Checkout p95 > 500ms",
    enabled: true,
    metric: "http.server.p95",
    condition: "avg(5m) > 500",
    scope: "service:checkout-service",
    channels: ["#oncall-payments"],
    severity: "high",
    triggered24h: 2,
  },
  {
    id: "rule_3",
    name: "OOM kills > 0",
    enabled: true,
    metric: "k8s.pod.oom_killed",
    condition: "sum(10m) > 0",
    scope: "cluster:prod-eu",
    channels: ["#oncall-infra"],
    severity: "high",
    triggered24h: 3,
  },
  {
    id: "rule_4",
    name: "DB pool utilization > 90%",
    enabled: true,
    metric: "db.pool.utilization",
    condition: "avg(15m) > 90",
    scope: "service:user-service",
    channels: ["#oncall-data"],
    severity: "medium",
    triggered24h: 1,
  },
  {
    id: "rule_5",
    name: "Anomaly: 5xx responses",
    enabled: true,
    metric: "http.server.5xx",
    condition: "anomaly z>3 (1h)",
    scope: "service:* env:production",
    channels: ["#oncall-platform"],
    severity: "medium",
    triggered24h: 0,
  },
  {
    id: "rule_6",
    name: "Disk used > 85%",
    enabled: false,
    metric: "host.disk.used_pct",
    condition: "max(10m) > 85",
    scope: "host:*",
    channels: ["Email: sre@logify.io"],
    severity: "low",
    triggered24h: 0,
  },
]

export function generateTimeSeries(
  points = 48,
  baseline = 1000,
  amplitude = 220,
  seed = 1,
  spike = false
): MetricPoint[] {
  const rng = mulberry32(seed)
  const now = Date.now()
  const out: MetricPoint[] = []
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now - i * 60_000 * 5)
    const wave = Math.sin((i / points) * Math.PI * 2) * amplitude
    const noise = (rng() - 0.5) * amplitude * 0.6
    let value = baseline + wave + noise
    if (spike && i < 6) value += amplitude * 1.6 + rng() * amplitude
    out.push({
      time: t.toISOString(),
      value: Math.max(0, Math.round(value)),
    })
  }
  return out
}

export function generateMultiSeries(
  points = 48,
  seed = 21
): SeriesPoint[] {
  const a = generateTimeSeries(points, 1450, 280, seed)
  const b = generateTimeSeries(points, 980, 200, seed + 1)
  const c = generateTimeSeries(points, 540, 140, seed + 2, true)
  const d = generateTimeSeries(points, 720, 180, seed + 3)
  return a.map((p, i) => ({
    time: p.time,
    api: p.value,
    web: b[i].value,
    worker: c[i].value,
    mobile: d[i].value,
  }))
}

export const overviewSeries = generateMultiSeries()
export const errorSeries = generateTimeSeries(48, 14, 8, 5, true)
export const latencySeries = generateTimeSeries(48, 220, 80, 11)
export const throughputSeries = generateTimeSeries(48, 8400, 1600, 17)

export const formatTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export const numberFormat = (n: number, opts?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("en-US", opts).format(n)
