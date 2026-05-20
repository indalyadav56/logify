"use client"

import { ExternalLinkIcon, SparklesIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAssistStore } from "@/lib/assist/assist-store"

export function AssistWelcome() {
  const { welcomeDismissed, dismissWelcome } = useAssistStore()

  if (welcomeDismissed) return null

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-8">
      <div className="relative rounded-lg border border-border bg-card px-5 py-4 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-2 right-2 size-7 text-muted-foreground"
          onClick={dismissWelcome}
          aria-label="Dismiss welcome"
        >
          <XIcon className="size-3.5" />
        </Button>
        <div className="flex gap-3 pr-6">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <SparklesIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-foreground">
              Welcome to Logify Assist
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Ask questions in plain language across logs, dashboards, and
              alerts. Assist uses your workspace context and suggests queries,
              root-cause summaries, and next steps.
            </p>
            <a
              href="#"
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              What&apos;s new in Assist
              <ExternalLinkIcon className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
