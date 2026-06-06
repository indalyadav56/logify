import * as React from "react"
import {
  ActivityIcon,
  BellRingIcon,
  BrainCircuitIcon,
  EyeIcon,
  GaugeIcon,
  GlobeIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  WaypointsIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type Feature = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  accent?: string
  highlight?: boolean
}

const FEATURES: Feature[] = [
  {
    icon: ScrollTextIcon,
    title: "Logs",
    body: "Index-free ingestion at petabyte scale. Pattern detection, parsing pipelines and live tail in one place.",
    highlight: true,
  },
  {
    icon: GaugeIcon,
    title: "Metrics",
    body: "High-cardinality, 1-second resolution. PromQL-compatible with native exemplars to traces and logs.",
  },
  {
    icon: WaypointsIcon,
    title: "Distributed traces",
    body: "OpenTelemetry-native. Service maps, span search, and tail-based sampling that retains every error.",
  },
  {
    icon: BellRingIcon,
    title: "Smart alerts",
    body: "Anomaly detection on any signal. Multi-condition routing to PagerDuty, Slack, Opsgenie or webhooks.",
  },
  {
    icon: BrainCircuitIcon,
    title: "Logify AI",
    body: "RCA suggestions, plain-English query, and automatic noise reduction trained on your topology.",
  },
  {
    icon: ActivityIcon,
    title: "Real-user monitoring",
    body: "Core Web Vitals, session replay and frontend errors stitched to backend traces end-to-end.",
  },
  {
    icon: GlobeIcon,
    title: "Synthetic checks",
    body: "Browser and API checks from 22 regions. Multi-step user journeys with one-click waterfall debug.",
  },
  {
    icon: EyeIcon,
    title: "Service catalog",
    body: "Auto-discovered ownership, runbooks, and SLOs. Know who owns what before the page goes off.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Compliance & governance",
    body: "Per-tenant isolation, role-based query scopes, audit log and BYOK encryption out of the box.",
  },
]

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
    >
      <SectionHeader
        eyebrow="One platform"
        title="Everything you need to keep production calm."
        subtitle="Logify replaces a dozen brittle tools with one correlated data plane — built for engineers who get paged."
      />

      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 bg-background/95 p-6 transition-colors hover:bg-background",
        feature.highlight && "lg:bg-background"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--brand)_14%,transparent),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
        <Icon className="size-4.5" />
      </div>
      <div className="relative">
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
          {feature.title}
        </h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
          {feature.body}
        </p>
      </div>
    </div>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string
  title: string
  subtitle?: string
  align?: "center" | "left"
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left"
      )}
    >
      <span className="inline-block text-[11.5px] font-semibold tracking-[0.18em] text-primary uppercase">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-pretty text-[15px] leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
