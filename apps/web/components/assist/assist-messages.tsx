"use client"

import * as React from "react"
import { SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAssistStore } from "@/lib/assist/assist-store"
import { AssistWelcome } from "@/components/assist/assist-welcome"

export function AssistMessages() {
  const { active, isThinking } = useAssistStore()
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [active.messages, isThinking])

  const empty = active.messages.length === 0

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col pb-4">
        {empty ? (
          <>
            <div className="flex flex-col items-center pt-16 pb-8">
              <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-muted/30">
                <SparklesIcon className="size-6 text-primary" />
              </span>
            </div>
            <AssistWelcome />
          </>
        ) : (
          <ul className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-6">
            {active.messages.map((msg) => (
              <li
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="flex max-w-full gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <SparklesIcon className="size-3.5" />
                    </span>
                    <AssistantContent content={msg.content} />
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-lg bg-primary px-3.5 py-2.5 text-[13px] leading-relaxed text-primary-foreground">
                    {msg.content}
                  </div>
                )}
              </li>
            ))}
            {isThinking ? (
              <li className="flex justify-start">
                <div className="flex gap-3">
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                    <SparklesIcon className="size-3.5 animate-pulse text-primary" />
                  </span>
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <ThinkingDot delay={0} />
                    <ThinkingDot delay={150} />
                    <ThinkingDot delay={300} />
                  </div>
                </div>
              </li>
            ) : null}
          </ul>
        )}
        <div ref={bottomRef} className="h-px shrink-0" />
      </div>
    </ScrollArea>
  )
}

function ThinkingDot({ delay }: { delay: number }) {
  return (
    <span
      className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  )
}

function AssistantContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="min-w-0 max-w-[min(640px,85vw)] rounded-lg border border-border bg-card px-4 py-3 text-[13px] leading-relaxed text-foreground shadow-sm">
      {parts.map((part, i) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const code = part.slice(3, -3).replace(/^\w+\n/, "")
          return (
            <pre
              key={i}
              className="font-code my-2 overflow-x-auto rounded-md bg-muted/50 p-3 text-[12px]"
            >
              {code.trim()}
            </pre>
          )
        }

        return (
          <span key={i} className="whitespace-pre-wrap">
            {renderInlineMarkdown(part)}
          </span>
        )
      })}
    </div>
  )
}

function renderInlineMarkdown(text: string) {
  const lines = text.split("\n")
  return lines.map((line, li) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={li} className="mb-1 font-semibold">
          {line.slice(2, -2)}
        </p>
      )
    }
    if (line.startsWith("- ")) {
      return (
        <p key={li} className="ml-2 text-muted-foreground">
          • {renderLinks(line.slice(2))}
        </p>
      )
    }
    if (/^\d+\.\s/.test(line)) {
      return (
        <p key={li} className="ml-2 text-muted-foreground">
          {renderLinks(line)}
        </p>
      )
    }
    if (line.startsWith("*") && line.endsWith("*")) {
      return (
        <p key={li} className="mt-2 text-[12px] italic text-muted-foreground">
          {line.slice(1, -1)}
        </p>
      )
    }
    return (
      <p key={li} className={li > 0 ? "mt-1" : ""}>
        {renderLinks(line)}
      </p>
    )
  })
}

function renderLinks(text: string) {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g
  const nodes: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = linkRe.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index))
    }
    const [, label, href] = match
    nodes.push(
      <a
        key={key++}
        href={href}
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        {label}
      </a>
    )
    last = match.index + match[0].length
  }

  if (last < text.length) nodes.push(text)
  return nodes.length ? nodes : text
}
