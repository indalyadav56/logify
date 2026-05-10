import * as React from "react"
import { QuoteIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden bg-[oklch(0.16_0.008_44)] lg:flex lg:flex-col">
      <BackgroundFx />

      <div className="relative z-10 flex flex-1 flex-col justify-between p-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11.5px] text-white/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Trusted by 4,200+ engineering teams
          </span>

          <h2 className="mt-6 max-w-md text-balance text-3xl font-semibold tracking-tight text-white">
            Observability that{" "}
            <span className="bg-gradient-to-br from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              answers
            </span>{" "}
            before you ask.
          </h2>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/60">
            Logs, metrics and traces in one AI-native platform. Set up in five
            minutes — no credit card, no sales call.
          </p>
        </div>

        <FeatureBullets />

        <Quote />
      </div>
    </aside>
  )
}

function FeatureBullets() {
  const items = [
    "Index-free log ingestion at any scale",
    "Logify AI surfaces root cause in seconds",
    "OpenTelemetry-native — bring any SDK",
    "SOC 2 · ISO 27001 · HIPAA",
  ]
  return (
    <ul className="mt-12 space-y-2.5 text-[13.5px] text-white/75">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5">
          <span className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-emerald-400" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

function Quote() {
  return (
    <figure className="relative mt-12 rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <QuoteIcon className="absolute top-4 right-4 size-8 text-white/10" />
      <blockquote className="text-[13.5px] leading-relaxed text-white/85">
        “We replaced three vendors with Logify in a week. Our on-call burnout
        score dropped 40%, and we caught a regression in pre-prod that would
        have cost us six figures.”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback className="bg-emerald-500/20 text-[10.5px] font-semibold text-emerald-200">
            SM
          </AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <div className="text-[12.5px] font-semibold text-white">
            Sara Mokri
          </div>
          <div className="text-[11px] text-white/60">
            Director of Platform Eng · Northwind
          </div>
        </div>
      </figcaption>
    </figure>
  )
}

function BackgroundFx() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,#000_30%,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute -top-40 left-[-10%] h-[420px] w-[520px] rounded-full bg-emerald-500/30 blur-[120px]" />
      <div className="absolute top-1/2 right-[-12%] h-[320px] w-[420px] rounded-full bg-cyan-400/15 blur-[120px]" />
    </div>
  )
}
