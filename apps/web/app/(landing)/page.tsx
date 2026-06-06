import * as React from "react"

import { Hero } from "@/components/marketing/hero"
import { LogoCloud } from "@/components/marketing/logo-cloud"
import { FeaturesGrid } from "@/components/marketing/features-grid"
import { LiveDemo } from "@/components/marketing/live-demo"
import { Integrations } from "@/components/marketing/integrations"
import { Stats } from "@/components/marketing/stats"
import { Testimonial } from "@/components/marketing/testimonial"
import { Pricing } from "@/components/marketing/pricing"
import { Faq } from "@/components/marketing/faq"
import { FinalCta } from "@/components/marketing/cta"
import { Reveal } from "@/components/marketing/reveal"

export default function LandingPage() {
  return (
    <>
      <div id="platform">
        <Hero />
      </div>
      <Reveal>
        <LogoCloud />
      </Reveal>
      <Reveal>
        <FeaturesGrid />
      </Reveal>
      <Reveal>
        <LiveDemo />
      </Reveal>
      <Reveal>
        <Integrations />
      </Reveal>
      <Reveal>
        <Stats />
      </Reveal>
      <Reveal>
        <Testimonial />
      </Reveal>
      <Reveal>
        <Pricing />
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
      <Reveal>
        <FinalCta />
      </Reveal>
    </>
  )
}
