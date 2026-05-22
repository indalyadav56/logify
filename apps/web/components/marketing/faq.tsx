import * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionHeader } from "@/components/marketing/features-grid"

const QA: { q: string; a: string }[] = [
  {
    q: "How is Logify different from Datadog or Dynatrace?",
    a: "Logify is OpenTelemetry-native and priced on usage, not seats. Our index-free log store delivers Datadog-class search at a fraction of the cost, and Logify AI surfaces root causes without you authoring a single dashboard.",
  },
  {
    q: "Do I need to instrument my code?",
    a: "Most teams are streaming signals within minutes — the agent auto-instruments common runtimes (Node, Python, Go, Java, .NET) and forwards any OTel SDK you already use. Manual instrumentation is fully supported when you want it.",
  },
  {
    q: "Can I run Logify on-prem or in a private VPC?",
    a: "Yes. Enterprise customers can deploy Logify in a single-tenant cloud, your own VPC, or fully air-gapped. We provide Helm charts and Terraform modules out of the box.",
  },
  {
    q: "How does pricing work?",
    a: "Pro is $29 per host per month for hosts, traces and metrics, plus $0.50 / GB ingested for logs with usage-based retention. There are no per-user charges and you can cap spend per project.",
  },
  {
    q: "Is my data secure?",
    a: "Logify is SOC 2 Type II, ISO 27001 and HIPAA-compliant. All data is encrypted in flight and at rest, with optional customer-managed keys (BYOK) on Enterprise plans.",
  },
  {
    q: "What happens after the trial ends?",
    a: "Nothing surprising. We don't ask for a credit card up front. At the end of the 30-day Pro trial you can downgrade to Starter, choose a paid plan, or talk to us about an annual contract.",
  },
]

export function Faq() {
  return (
    <section className="border-t border-border/60 bg-muted/20 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions, answered."
          subtitle="Can't find what you're looking for? Email hello@logify.io and a real engineer will reply within a business day."
        />

        <Accordion
          type="single"
          collapsible
          className="mt-10 divide-y divide-border/60 rounded-2xl border border-border/60 bg-background"
          defaultValue="item-0"
        >
          {QA.map((item, idx) => (
            <AccordionItem
              key={item.q}
              value={`item-${idx}`}
              className="border-0 px-5"
            >
              <AccordionTrigger className="py-4 text-left text-[14.5px] font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-[13.5px] leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
