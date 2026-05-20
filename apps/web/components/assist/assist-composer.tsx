"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  InfoIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  SparklesIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AssistPromptChips } from "@/components/assist/assist-prompt-chips"
import { AssistSlashMenu } from "@/components/assist/assist-slash-menu"
import { CONTEXT_PROMPTS } from "@/lib/assist/prompt-catalog"
import { useAssistStore } from "@/lib/assist/assist-store"
import type { AssistContext } from "@/lib/assist/types"

const CONTEXT_ICONS: Record<
  AssistContext,
  React.ComponentType<{ className?: string }>
> = {
  general: SparklesIcon,
  logs: ScrollTextIcon,
  dashboards: LayoutDashboardIcon,
  alerts: InfoIcon,
}

export function AssistComposer() {
  const { active, setContext, sendMessage, isThinking } = useAssistStore()
  const [draft, setDraft] = React.useState("")
  const [agentic, setAgentic] = React.useState(true)
  const [slashOpen, setSlashOpen] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const context = active.context ?? "general"
  const ContextIcon = CONTEXT_ICONS[context]

  React.useEffect(() => {
    setSlashOpen(draft.trimStart().startsWith("/"))
  }, [draft])

  const submit = () => {
    if (!draft.trim() || isThinking) return
    void sendMessage(draft)
    setDraft("")
    setSlashOpen(false)
    textareaRef.current?.focus()
  }

  const insertPrompt = (text: string) => {
    setDraft(text)
    setSlashOpen(false)
    textareaRef.current?.focus()
  }

  return (
    <div className="shrink-0 border-t border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-2xl">
        <AssistPromptChips onPick={insertPrompt} />

        <div className="relative mt-3">
          {slashOpen ? (
            <AssistSlashMenu
              query={draft}
              onSelect={(insert) => {
                setDraft(insert)
                setSlashOpen(false)
              }}
            />
          ) : null}

          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder="Start typing or press / to see available prompts"
              rows={2}
              className="max-h-40 min-h-[56px] w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground"
            />

            <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={context}
                  onValueChange={(v) => setContext(v as AssistContext)}
                >
                  <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-muted/40 px-2 text-[11px] shadow-none">
                    <ContextIcon className="size-3 text-primary" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CONTEXT_PROMPTS) as AssistContext[]).map(
                      (key) => (
                        <SelectItem
                          key={key}
                          value={key}
                          className="text-[12px]"
                        >
                          {CONTEXT_PROMPTS[key].label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <SparklesIcon className="size-3 text-primary" />
                  <span className="font-medium text-foreground">Agentic</span>
                  <Switch
                    checked={agentic}
                    onCheckedChange={setAgentic}
                    className="scale-75"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="About agentic mode"
                      >
                        <InfoIcon className="size-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-[12px]">
                      Agentic mode plans multi-step analysis across logs and
                      dashboards before responding.
                    </TooltipContent>
                  </Tooltip>
                </label>
              </div>

              <Button
                type="button"
                size="icon-sm"
                className={cn(
                  "size-8 rounded-lg",
                  draft.trim()
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
                disabled={!draft.trim() || isThinking}
                onClick={submit}
                aria-label="Send message"
              >
                <ArrowUpIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Logify Assist uses AI. Verify important information and operational
          decisions.
        </p>
      </div>
    </div>
  )
}
