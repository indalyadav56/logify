import type { LogEntry, LogLevel } from "@/lib/mock-data"
import type { TimeseriesBucket } from "@/components/observability/timeseries-chart"

const LEVELS: LogLevel[] = ["info", "warn", "error"]

export function filterLogsByQuery(logs: LogEntry[], query?: string) {
  const q = query?.trim().toLowerCase()
  if (!q) return logs

  return logs.filter((log) => {
    const haystack = [
      log.message,
      log.service,
      log.host,
      log.level,
      log.environment,
      `level:${log.level}`,
      `service:"${log.service}"`,
    ]
      .join(" ")
      .toLowerCase()

    if (q.includes(" or ")) {
      const parts = q.split(/\s+or\s+/i).map((p) => p.trim())
      return parts.some((part) => haystack.includes(part))
    }
    return haystack.includes(q)
  })
}

export function buildVolumeBuckets(logs: LogEntry[], bucketCount = 24): TimeseriesBucket[] {
  if (logs.length === 0) {
    return Array.from({ length: bucketCount }, (_, i) => ({
      bucket: `${i}`,
      info: 0,
      warn: 0,
      error: 0,
      none: 0,
    }))
  }

  const times = logs.map((l) => new Date(l.timestamp).getTime())
  const min = Math.min(...times)
  const max = Math.max(...times)
  const span = Math.max(max - min, 60_000)
  const step = span / bucketCount

  const buckets: TimeseriesBucket[] = Array.from({ length: bucketCount }, (_, i) => {
    const start = min + i * step
    const end = start + step
    return {
      bucket: formatBucketLabel(start),
      bucketStart: start,
      bucketEnd: end,
      info: 0,
      warn: 0,
      error: 0,
      none: 0,
    }
  })

  for (const log of logs) {
    const t = new Date(log.timestamp).getTime()
    const idx = Math.min(
      bucketCount - 1,
      Math.max(0, Math.floor((t - min) / step))
    )
    const b = buckets[idx]
    if (log.level === "info" || log.level === "debug" || log.level === "trace") {
      b.info += 1
    } else if (log.level === "warn") {
      b.warn += 1
    } else if (log.level === "error" || log.level === "fatal") {
      b.error += 1
    } else {
      b.none += 1
    }
  }

  return buckets
}

export function computeErrorRate(logs: LogEntry[]) {
  if (logs.length === 0) return { value: 0, delta: 0, count: 0 }
  const errors = logs.filter(
    (l) => l.level === "error" || l.level === "fatal"
  ).length
  const value = (errors / logs.length) * 100
  return { value, delta: -0.3, count: errors }
}

export function topServices(logs: LogEntry[], limit = 6) {
  const counts = new Map<string, number>()
  for (const log of logs) {
    counts.set(log.service, (counts.get(log.service) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

function formatBucketLabel(ms: number) {
  const d = new Date(ms)
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function levelTotals(logs: LogEntry[]): Record<LogLevel, number> {
  const totals = {
    trace: 0,
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    fatal: 0,
  }
  for (const log of logs) {
    totals[log.level] += 1
  }
  return totals
}
