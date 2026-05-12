/** Maps query-bar presets to millisecond durations. */

const RANGE_MS: Record<string, number> = {
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "6h": 6 * 60 * 60_000,
  "24h": 24 * 60 * 60_000,
  "7d": 7 * 24 * 60 * 60_000,
  "30d": 30 * 24 * 60 * 60_000,
}

export function timeRangeToIso(range: string): { from: string; to: string } {
  const to = new Date()
  const defaultWindow = RANGE_MS["30m"] ?? 30 * 60_000
  const delta = RANGE_MS[range] ?? defaultWindow
  const from = new Date(to.getTime() - delta)
  return { from: from.toISOString(), to: to.toISOString() }
}
