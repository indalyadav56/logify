"use client"

import * as React from "react"
import {
  BookmarkIcon,
  CalendarClockIcon,
  ChevronDownIcon,
  CodeIcon,
  HistoryIcon,
  PauseIcon,
  PinIcon,
  PlayIcon,
  SaveIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
  ZapIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type QueryBarProps = {
  value: string
  onChange: (value: string) => void
  range: string
  onRangeChange: (value: string) => void
  paused?: boolean
  onPauseChange?: (paused: boolean) => void
  onRun?: () => void
  className?: string
}

const RANGES: { value: string; label: string; group: string }[] = [
  { value: "5m", label: "Last 5 minutes", group: "Quick" },
  { value: "15m", label: "Last 15 minutes", group: "Quick" },
  { value: "30m", label: "Last 30 minutes", group: "Quick" },
  { value: "1h", label: "Last 1 hour", group: "Quick" },
  { value: "6h", label: "Last 6 hours", group: "Quick" },
  { value: "24h", label: "Last 24 hours", group: "Long" },
  { value: "7d", label: "Last 7 days", group: "Long" },
  { value: "30d", label: "Last 30 days", group: "Long" },
]

const SUGGESTIONS = [
  { kind: "Field", token: "service:" },
  { kind: "Field", token: "level:" },
  { kind: "Field", token: "host:" },
  { kind: "Field", token: "trace.id:" },
  { kind: "Operator", token: "AND" },
  { kind: "Operator", token: "OR" },
  { kind: "Saved", token: 'service:"payments-service" level:error' },
  { kind: "Saved", token: 'level:(error OR fatal)' },
]

export function QueryBar({
  value,
  onChange,
  range,
  onRangeChange,
  paused,
  onPauseChange,
  onRun,
  className,
}: QueryBarProps) {
  const [focused, setFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const rangeLabel =
    RANGES.find((r) => r.value === range)?.label ?? "Custom range"

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-stretch gap-1.5 rounded-md border border-border/70 bg-background p-1 shadow-xs transition-shadow",
        focused && "ring-2 ring-ring/30",
        className
      )}
    >
      <div className="relative flex flex-1 items-center gap-2 px-2">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRun?.()
            if (e.key === "Escape") setFocused(false)
          }}
          placeholder='service:"payments-service" level:error "ECONNREFUSED"'
          className="h-8 w-full bg-transparent font-mono text-[13px] outline-none placeholder:text-muted-foreground/70"
        />
        {value ? (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              onChange("")
              inputRef.current?.focus()
            }}
            aria-label="Clear"
          >
            <XIcon />
          </Button>
        ) : null}
        <Kbd className="hidden sm:inline-flex">⏎</Kbd>

        {focused ? (
          <div className="absolute top-full left-0 z-50 mt-1.5 w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-black/5 dark:ring-white/5">
            <div className="flex items-center gap-2 border-b border-border/60 bg-popover px-3 py-1.5 text-[11px] text-muted-foreground">
              <SparklesIcon className="size-3 text-violet-500" />
              <span>Suggestions</span>
              <span className="ml-auto">↑ ↓ to navigate · ⏎ to insert</span>
            </div>
            <ul className="max-h-72 overflow-auto bg-popover py-1">
              {SUGGESTIONS.map((s) => (
                <li key={s.token}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onChange(value ? `${value} ${s.token}` : s.token)
                      inputRef.current?.focus()
                    }}
                    className="flex w-full items-center gap-3 px-3 py-1.5 text-left text-[13px] hover:bg-muted/60"
                  >
                    <span className="w-16 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      {s.kind}
                    </span>
                    <span className="flex-1 truncate font-mono">
                      {s.token}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-1 border-l border-border/60 pl-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
            >
              <CalendarClockIcon />
              {rangeLabel}
              <ChevronDownIcon className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Quick</DropdownMenuLabel>
            {RANGES.filter((r) => r.group === "Quick").map((r) => (
              <DropdownMenuItem
                key={r.value}
                onClick={() => onRangeChange(r.value)}
              >
                {r.label}
                {r.value === range ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    selected
                  </span>
                ) : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Long</DropdownMenuLabel>
            {RANGES.filter((r) => r.group === "Long").map((r) => (
              <DropdownMenuItem
                key={r.value}
                onClick={() => onRangeChange(r.value)}
              >
                {r.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>Absolute time…</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="sm"
          onClick={onRun}
          className="h-8 gap-1.5 bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground"
        >
          <ZapIcon /> Run
        </Button>
      </div>
    </div>
  )
}

export function QueryBarChips({
  chips,
  className,
}: {
  chips: { label: string; value: string }[]
  className?: string
}) {
  if (chips.length === 0) return null
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {chips.map((c) => (
        <span
          key={`${c.label}-${c.value}`}
          className="inline-flex items-center gap-1 rounded-md border bg-muted/50 py-0.5 pr-1 pl-1.5 font-mono text-[11px]"
        >
          <span className="text-muted-foreground">{c.label}:</span>
          <span>{c.value}</span>
          <button
            type="button"
            className="rounded-sm p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            aria-label="Remove filter"
          >
            <XIcon className="size-2.5" />
          </button>
        </span>
      ))}
      <Button
        variant="ghost"
        size="xs"
        className="h-5 px-1 text-[11px] text-muted-foreground"
      >
        <BookmarkIcon /> Save query
      </Button>
    </div>
  )
}
