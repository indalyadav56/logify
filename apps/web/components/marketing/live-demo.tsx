import * as React from "react"
import { CheckIcon, TerminalIcon, ZapIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { SectionHeader } from "@/components/marketing/features-grid"

const STEPS: { title: string; body: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    icon: TerminalIcon,
    title: "1. Install the agent",
    body: "One command for any host, container or Kubernetes cluster. Auto-discovers services, processes and logs.",
  },
  {
    icon: ZapIcon,
    title: "2. Stream every signal",
    body: "Logs, metrics and OTel traces flow into a single correlated store. No schemas to design, no indexes to manage.",
  },
  {
    icon: CheckIcon,
    title: "3. Get answers, not dashboards",
    body: "Logify AI clusters errors, finds the deploy that broke it, and writes the alert that catches it next time.",
  },
]

export function LiveDemo() {
  return (
    <section
      id="demo"
      className="relative scroll-mt-24 border-y border-border/60 bg-gradient-to-b from-background via-background to-muted/30 py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="From signal to fix"
          title="Three minutes to see what your stack is hiding."
          subtitle="Drop in the agent and watch every service report in. No instrumentation marathon, no proprietary SDKs."
        />

        <div className="mt-14 grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          <ol className="space-y-6 lg:col-span-5">
            {STEPS.map((s) => {
              const Icon = s.icon
              return (
                <li
                  key={s.title}
                  className="group flex gap-4 rounded-xl border border-border/60 bg-card/50 p-5 transition-colors hover:bg-card"
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <Icon className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="text-[14.5px] font-semibold tracking-tight text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="lg:col-span-7">
            <CodeTerminal />
          </div>
        </div>
      </div>
    </section>
  )
}

function CodeTerminal() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.16_0.008_44)] shadow-xl shadow-black/30 ring-1 ring-white/5">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-500/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <div className="flex items-center gap-2">
          <Tab label="bash" active />
          <Tab label="docker" />
          <Tab label="k8s" />
          <Tab label="otel" />
        </div>
        <button
          type="button"
          className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/60 hover:bg-white/10 hover:text-white"
        >
          Copy
        </button>
      </div>

      <pre className="overflow-x-auto px-4 py-5 font-mono text-[12.5px] leading-6 text-white/85">
        <code>
          <span className="text-white/40"># Install the Logify agent</span>
          {"\n"}
          <span className="text-emerald-400">$</span> curl -fsSL{" "}
          <span className="text-sky-300">https://get.logify.io</span> | sh
          {"\n\n"}
          <span className="text-white/40"># Bootstrap with your token</span>
          {"\n"}
          <span className="text-emerald-400">$</span> logify init \
          {"\n"}
          {"    "}--token{" "}
          <span className="text-amber-300">$LOGIFY_API_TOKEN</span> \
          {"\n"}
          {"    "}--service{" "}
          <span className="text-amber-300">checkout-api</span> \
          {"\n"}
          {"    "}--env{" "}
          <span className="text-amber-300">production</span>
          {"\n\n"}
          <span className="text-white/40">
            ✓ detected runtime: node 22.4 · pid 18245
          </span>
          {"\n"}
          <span className="text-white/40">
            ✓ instrumented 14 spans · 6 frameworks
          </span>
          {"\n"}
          <span className="text-emerald-400">✓ streaming logs · 8,412 ev/s</span>
          {"\n"}
          <span className="text-white/40">
            → open https://app.logify.io/svc/checkout-api
          </span>
        </code>
      </pre>
    </div>
  )
}

function Tab({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[10.5px] font-medium",
        active
          ? "bg-white/10 text-white"
          : "text-white/45 hover:bg-white/5 hover:text-white/80"
      )}
    >
      {label}
    </span>
  )
}
