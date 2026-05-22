import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-brand/10 px-6 py-14 text-center shadow-sm sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_70%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Ship faster. Sleep through the night.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-balance text-[15px] leading-relaxed text-muted-foreground">
          Get full-stack observability with AI-powered RCA in under five
          minutes. No credit card. No sales call.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 gap-1.5 px-5 text-sm">
            <Link href="/signup">
              Start free <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 px-5 text-sm"
          >
            <Link href="#">Book a 20-min demo</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
