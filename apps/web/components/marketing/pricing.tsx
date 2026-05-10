import * as React from "react"
import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "@/components/marketing/features-grid"

type Plan = {
  name: string
  price: string
  cadence: string
  blurb: string
  cta: string
  href: string
  highlight?: boolean
  features: string[]
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    cadence: "free forever",
    blurb: "For hobby projects and POCs that still deserve real telemetry.",
    cta: "Start for free",
    href: "/signup",
    features: [
      "5 GB logs / mo",
      "10k metrics series",
      "7-day retention",
      "1 user · email support",
      "Community integrations",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "per host / month",
    blurb: "For growing teams that ship to production every day.",
    cta: "Start 30-day trial",
    href: "/signup",
    highlight: true,
    features: [
      "Unlimited logs · pay per ingest",
      "Custom metric resolution",
      "30-day retention (configurable)",
      "Logify AI · pattern detection",
      "PagerDuty, Slack & 600+ integrations",
      "SSO / SAML, audit log",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual contract",
    blurb: "For regulated industries and global SRE organizations.",
    cta: "Talk to sales",
    href: "#",
    features: [
      "Dedicated tenancy & BYOK",
      "Per-region data residency",
      "13-month retention available",
      "Custom SLA · 24/7 phone support",
      "Solution architect & onboarding",
      "FedRAMP Moderate (in process)",
    ],
  },
]

export function Pricing() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
    >
      <SectionHeader
        eyebrow="Pricing"
        title="Honest, usage-based pricing."
        subtitle="No 5-year commits, no surprise overages. Every plan includes the same fast query engine and Logify AI core."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((p) => (
          <PlanCard key={p.name} plan={p} />
        ))}
      </div>

      <p className="mt-8 text-center text-[12.5px] text-muted-foreground">
        Need a custom plan or air-gapped deployment?{" "}
        <Link href="#" className="text-foreground underline-offset-4 hover:underline">
          Get in touch
        </Link>
        .
      </p>
    </section>
  )
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border border-border/60 bg-card/60 p-6 transition-colors",
        plan.highlight &&
          "border-primary/50 bg-card shadow-xl shadow-primary/10 ring-1 ring-primary/30"
      )}
    >
      {plan.highlight ? (
        <Badge className="absolute -top-2.5 right-6">Most popular</Badge>
      ) : null}

      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
          {plan.name}
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{plan.blurb}</p>
      </div>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {plan.price}
        </span>
        <span className="text-[12.5px] text-muted-foreground">
          {plan.cadence}
        </span>
      </div>

      <Button
        asChild
        className="mt-5"
        variant={plan.highlight ? "default" : "outline"}
      >
        <Link href={plan.href}>{plan.cta}</Link>
      </Button>

      <ul className="mt-6 space-y-2.5 border-t border-border/60 pt-6">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-[13px] text-muted-foreground"
          >
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
