"use client"

import { LayoutDashboardIcon } from "lucide-react"

import { useAssistStore } from "@/lib/assist/assist-store"
import { CONTEXT_PROMPTS } from "@/lib/assist/prompt-catalog"

export function AssistPromptChips({
  onPick,
}: {
  onPick: (prompt: string) => void
}) {
  const { active } = useAssistStore()
  const context = active.context ?? "general"
  const { label, prompts } = CONTEXT_PROMPTS[context]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <LayoutDashboardIcon className="size-3.5" />
        {label}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="shrink-0 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-left text-[12px] text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
