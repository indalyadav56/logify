import * as React from "react"

const STATS: { value: string; label: string; sub: string }[] = [
  {
    value: "12 PB",
    label: "Logs ingested daily",
    sub: "across customer fleets",
  },
  {
    value: "47 ms",
    label: "p95 query latency",
    sub: "on 30-day windows",
  },
  {
    value: "92%",
    label: "MTTR reduction",
    sub: "after 30 days on Logify AI",
  },
  {
    value: "99.99%",
    label: "Multi-region uptime",
    sub: "with active-active failover",
  },
]

export function Stats() {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden bg-border/40 sm:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-background/95 px-6 py-10 text-center sm:py-12"
          >
            <div className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-2 text-[13px] font-medium text-foreground">
              {s.label}
            </div>
            <div className="text-[12px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
