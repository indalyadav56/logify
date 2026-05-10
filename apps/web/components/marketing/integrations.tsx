import * as React from "react"

import { cn } from "@/lib/utils"
import { SectionHeader } from "@/components/marketing/features-grid"

const INTEGRATIONS: { name: string; glyph: string; tone?: string }[] = [
  { name: "Kubernetes", glyph: "⎈", tone: "text-sky-400" },
  { name: "AWS", glyph: "AWS", tone: "text-amber-400" },
  { name: "GCP", glyph: "GCP", tone: "text-rose-400" },
  { name: "Azure", glyph: "Az", tone: "text-cyan-300" },
  { name: "Postgres", glyph: "🐘", tone: "" },
  { name: "Kafka", glyph: "Kf", tone: "text-zinc-300" },
  { name: "Redis", glyph: "Rd", tone: "text-rose-400" },
  { name: "Node.js", glyph: "JS", tone: "text-emerald-300" },
  { name: "Go", glyph: "Go", tone: "text-sky-300" },
  { name: "Python", glyph: "Py", tone: "text-yellow-300" },
  { name: "Rust", glyph: "Rs", tone: "text-orange-300" },
  { name: "Java", glyph: "Jv", tone: "text-orange-300" },
  { name: "OpenTelemetry", glyph: "OTel", tone: "text-violet-300" },
  { name: "Slack", glyph: "Sl", tone: "text-fuchsia-300" },
  { name: "PagerDuty", glyph: "PD", tone: "text-emerald-300" },
  { name: "GitHub", glyph: "GH", tone: "text-zinc-200" },
  { name: "Terraform", glyph: "Tf", tone: "text-violet-300" },
  { name: "NGINX", glyph: "Ng", tone: "text-emerald-300" },
  { name: "ClickHouse", glyph: "Ch", tone: "text-yellow-300" },
  { name: "Datadog", glyph: "Dd", tone: "text-violet-300" },
]

export function Integrations() {
  return (
    <section
      id="integrations"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
    >
      <SectionHeader
        eyebrow="600+ integrations"
        title="Plug into the stack you already run."
        subtitle="OpenTelemetry-native with first-class support for the runtimes, clouds and message buses your team relies on every day."
      />

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {INTEGRATIONS.map((i) => (
          <div
            key={i.name}
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5 transition-all hover:border-primary/30 hover:bg-card hover:shadow-md hover:shadow-primary/5"
          >
            <span
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold tracking-tight text-foreground",
                i.tone
              )}
            >
              {i.glyph}
            </span>
            <span className="truncate text-[13px] font-medium text-foreground">
              {i.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
