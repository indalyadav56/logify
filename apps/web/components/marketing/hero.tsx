import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, PlayIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardPreview } from "@/components/marketing/dashboard-preview"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <BackgroundFx />

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Link
            href="#"
            className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[12px] text-muted-foreground backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground"
          >
            <SparklesIcon className="size-3.5 text-primary" />
            <span>Introducing Logify AI — RCA in seconds</span>
            <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Observability that{" "}
            <span className="text-brand-gradient">answers</span>{" "}
            before you ask.
          </h1>

          <p className="mt-5 max-w-2xl text-balance text-[15.5px] leading-relaxed text-muted-foreground sm:text-base">
            Logify unifies logs, metrics and traces into one AI-native platform.
            Ingest petabytes, query in milliseconds, and let Davis-grade
            correlation surface the root cause — automatically.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
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
          </div>

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
        </div>

        <div className="relative mx-auto mt-14 max-w-6xl">
          <div
            aria-hidden
            className="absolute -inset-x-10 -inset-y-8 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/0 to-brand/10 blur-2xl"
          />
          <DashboardPreview />
        </div>
      </div>
    </section>
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
    </div>
  )
}
