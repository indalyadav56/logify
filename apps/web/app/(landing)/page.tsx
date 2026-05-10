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

export default function LandingPage() {
  return (
    <>
      <div id="platform">
        <Hero />
      </div>
      <LogoCloud />
      <FeaturesGrid />
      <LiveDemo />
      <Integrations />
      <Stats />
      <Testimonial />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  )
}
