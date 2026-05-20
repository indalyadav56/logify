"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Part =
  | { type: "text"; value: string }
  | { type: "url"; value: string }
  | { type: "status"; value: string }

const URL_RE = /(https?:\/\/[^\s<>"']+)/g
const STATUS_RE = /\b([45]\d{2})\b/g

function tokenizeLogMessage(message: string): Part[] {
  const parts: Part[] = []
  let i = 0

  const matches: { index: number; length: number; part: Part }[] = []

  for (const m of message.matchAll(URL_RE)) {
    if (m.index != null) {
      matches.push({
        index: m.index,
        length: m[0].length,
        part: { type: "url", value: m[0] },
      })
    }
  }
  for (const m of message.matchAll(STATUS_RE)) {
    if (m.index != null) {
      matches.push({
        index: m.index,
        length: m[0].length,
        part: { type: "status", value: m[0] },
      })
    }
  }

  matches.sort((a, b) => a.index - b.index)

  for (const match of matches) {
    if (match.index < i) continue
    if (match.index > i) {
      parts.push({ type: "text", value: message.slice(i, match.index) })
    }
    parts.push(match.part)
    i = match.index + match.length
  }

  if (i < message.length) {
    parts.push({ type: "text", value: message.slice(i) })
  }

  return parts.length > 0 ? parts : [{ type: "text", value: message }]
}

export function LogMessageContent({
  message,
  wrap,
  className,
}: {
  message: string
  wrap: boolean
  className?: string
}) {
  const parts = React.useMemo(() => tokenizeLogMessage(message), [message])

  return (
    <span
      className={cn(
        "font-code text-[13px] leading-relaxed text-foreground/90",
        wrap ? "whitespace-pre-wrap break-words" : "whitespace-nowrap",
        className
      )}
    >
      {parts.map((part, idx) => {
        if (part.type === "url") {
          return (
            <a
              key={idx}
              href={part.value}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[#2563eb] underline-offset-2 hover:underline dark:text-[#60a5fa]"
              onClick={(e) => e.stopPropagation()}
            >
              {part.value}
            </a>
          )
        }
        if (part.type === "status") {
          return (
            <span
              key={idx}
              className="font-semibold text-[#c026d3] dark:text-[#e879f9]"
            >
              {part.value}
            </span>
          )
        }
        return <span key={idx}>{part.value}</span>
      })}
    </span>
  )
}
