import * as React from "react"
import { QuoteIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Testimonial() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-8 sm:p-12">
        <QuoteIcon className="absolute top-8 right-8 size-16 text-primary/15" />
        <p className="text-balance text-2xl leading-snug font-medium tracking-tight text-foreground sm:text-3xl">
          “We replaced three vendors with Logify in a week. Our on-call burnout
          score dropped 40%, and we caught a regression in pre-prod that would
          have cost us six figures. It pays for itself.”
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Avatar className="size-11">
            <AvatarFallback className="bg-primary/15 text-primary">
              SM
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-[14px] font-semibold text-foreground">
              Sara Mokri
            </div>
            <div className="text-[12.5px] text-muted-foreground">
              Director of Platform Engineering · Northwind
            </div>
          </div>
          <div className="ml-auto hidden flex-col items-end gap-1 sm:flex">
            <div className="font-serif text-xl tracking-tight text-foreground/80">
              Northwind
            </div>
            <div className="text-[11px] text-muted-foreground">
              4,200+ engineers
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
