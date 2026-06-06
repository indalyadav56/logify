import * as React from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  BrainCircuitIcon,
  PlayIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardPreview } from "@/components/marketing/dashboard-preview"
import { Reveal } from "@/components/marketing/reveal"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <BackgroundFx />

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal>
            <Link
              href="#"
              className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[12px] text-muted-foreground backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground"
            >
              <SparklesIcon className="size-3.5 text-primary" />
              <span>Introducing Logify AI — RCA in seconds</span>
              <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Observability that{" "}
              <span className="text-brand-gradient">answers</span> before you
              ask.
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-5 max-w-2xl text-balance text-[15.5px] leading-relaxed text-muted-foreground sm:text-base">
              Logify unifies logs, metrics and traces into one AI-native
              platform. Ingest petabytes, query in milliseconds, and let
              Davis-grade correlation surface the root cause — automatically.
            </p>
          </Reveal>

          <Reveal
            delay={180}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="h-11 gap-1.5 px-5 text-sm">
              <Link href="/signup">
                Start free 30-day trial
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 gap-1.5 border-border/70 px-5 text-sm"
            >
              <Link href="#demo">
                <PlayIcon className="size-4" />
                Watch the 2-min demo
              </Link>
            </Button>
          </Reveal>

          <Reveal delay={240} as="div">
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
              <li className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                No credit card required
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                5-minute setup
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                SOC 2 · ISO 27001 · HIPAA
              </li>
            </ul>
          </Reveal>
        </div>

        <Reveal delay={120} className="relative mx-auto mt-14 max-w-6xl">
          <div
            aria-hidden
            className="absolute -inset-x-10 -inset-y-8 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/0 to-brand/10 blur-2xl"
          />
          <DashboardPreview />
          <AiInsightCard />
        </Reveal>
      </div>
    </section>
  )
}

/**
 * Signature floating card: an AI root-cause callout overlapping the bottom-left
 * corner of the product screenshot. Hidden on small screens to avoid clutter.
 */
function AiInsightCard() {
  return (
    <div className="animate-float pointer-events-none absolute -bottom-6 -left-4 hidden w-[19rem] rounded-xl border border-border/70 bg-card/95 p-3.5 shadow-2xl shadow-black/20 ring-1 ring-black/5 backdrop-blur md:block lg:-left-10">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
          <BrainCircuitIcon className="size-4" />
        </span>
        <span className="text-[12.5px] font-semibold tracking-tight text-foreground">
          Logify AI · Root cause
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          live
        </span>
      </div>
      <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
        Spike in <span className="font-medium text-foreground">5xx</span> on{" "}
        <span className="font-mono text-foreground">checkout-api</span> traced to
        deploy{" "}
        <span className="font-mono text-foreground">v2.8.1</span> — a null guard
        regression in <span className="font-mono text-foreground">OrderHandler:142</span>.
      </p>
      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground">
          confidence 96%
        </span>
        <span>· 1,204 events correlated · 0.8s</span>
      </div>
    </div>
  )
}

function BackgroundFx() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-subtle opacity-60 [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2">
        <div className="h-[420px] w-[820px] rounded-full bg-primary/25 blur-[120px]" />
      </div>
      <div className="absolute top-1/3 right-[-12%] h-[320px] w-[420px] rounded-full bg-brand/15 blur-[120px]" />
      <div className="absolute top-1/4 left-[-10%] h-[280px] w-[360px] rounded-full bg-primary/10 blur-[120px]" />
    </div>
  )
}
