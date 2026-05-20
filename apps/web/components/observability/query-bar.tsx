"use client"

import * as React from "react"
import {
  BookmarkIcon,
  CalendarClockIcon,
  CheckIcon,
  ChevronDownIcon,
  SearchIcon,
  XIcon,
  ZapIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
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

type SuggestionItem = {
  id: string
  category: string
  token: string
}

const SUGGESTIONS: { label: string; items: SuggestionItem[] }[] = [
  {
    label: "Fields",
    items: [
      { id: "f1", category: "field", token: "service:" },
      { id: "f2", category: "field", token: "level:" },
      { id: "f3", category: "field", token: "host:" },
      { id: "f4", category: "field", token: "message:" },
      { id: "f5", category: "field", token: "trace.id:" },
    ],
  },
  {
    label: "Operators",
    items: [
      { id: "o1", category: "op", token: "AND" },
      { id: "o2", category: "op", token: "OR" },
      { id: "o3", category: "op", token: "NOT" },
      { id: "o4", category: "op", token: "LIKE" },
      { id: "o5", category: "op", token: "NOT LIKE" },
    ],
  },
  {
    label: "Saved",
    items: [
      {
        id: "s1",
        category: "saved",
        token: 'service:"payments-service" level:error',
      },
      {
        id: "s2",
        category: "saved",
        token: 'message LIKE "*ECONNREFUSED*"',
      },
      {
        id: "s3",
        category: "saved",
        token: "level:(error OR fatal)",
      },
    ],
  },
]

function insertToken(current: string, token: string) {
  const trimmed = current.trimEnd()
  if (!trimmed) return token
  const needsSpace = !trimmed.endsWith(" ") && !trimmed.endsWith("(")
  return `${trimmed}${needsSpace ? " " : ""}${token}`
}

function filterSuggestions(search: string) {
  const q = search.trim().toLowerCase()
  if (!q) return SUGGESTIONS

  return SUGGESTIONS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.token.toLowerCase().includes(q) ||
        group.label.toLowerCase().includes(q)
    ),
  })).filter((group) => group.items.length > 0)
}

export function QueryBar({
  value,
  onChange,
  range,
  onRangeChange,
  onRun,
  className,
}: QueryBarProps) {
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const skipOpenOnFocusRef = React.useRef(false)

  const rangeLabel =
    RANGES.find((r) => r.value === range)?.label ?? "Custom range"

  const groups = React.useMemo(() => filterSuggestions(value), [value])
  const indexedGroups = React.useMemo(() => {
    let i = 0
    return groups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({ ...item, index: i++ })),
    }))
  }, [groups])
  const flat = React.useMemo(
    () => indexedGroups.flatMap((g) => g.items),
    [indexedGroups]
  )

  React.useEffect(() => setActiveIndex(0), [value, open])

  React.useEffect(() => {
    if (!open || !listRef.current) return
    listRef.current
      .querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, open])

  React.useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  const closeSuggestions = React.useCallback(() => {
    setOpen(false)
    skipOpenOnFocusRef.current = true
  }, [])

  const apply = React.useCallback(
    (token: string, mode: "insert" | "replace" = "insert") => {
      onChange(mode === "replace" ? token : insertToken(value, token))
      closeSuggestions()
      inputRef.current?.focus()
    },
    [closeSuggestions, onChange, value]
  )

  const handleRun = React.useCallback(() => {
    closeSuggestions()
    inputRef.current?.blur()
    onRun?.()
  }, [closeSuggestions, onRun])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false)
      return
    }

    if (!open || flat.length === 0) {
      if (e.key === "Enter") handleRun()
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setOpen(true)
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % flat.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + flat.length) % flat.length)
    } else if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault()
      const item = flat[activeIndex]
      if (item) apply(item.token)
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-stretch rounded-md border border-border bg-card",
        open && "border-ring/40 ring-1 ring-ring/30",
        className
      )}
    >
      <div className="relative min-w-0 flex-1">
        <div className="flex h-10 items-center gap-2 px-3">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              if (skipOpenOnFocusRef.current) {
                skipOpenOnFocusRef.current = false
                return
              }
              setOpen(true)
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls="query-suggestions"
            aria-autocomplete="list"
            placeholder='service:"payments-service" level:error'
            className="font-code h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
          />
          {value ? (
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7 text-muted-foreground"
              onClick={() => {
                onChange("")
                inputRef.current?.focus()
              }}
              aria-label="Clear"
            >
              <XIcon className="size-3.5" />
            </Button>
          ) : null}
        </div>

        {open ? (
          <div
            id="query-suggestions"
            ref={listRef}
            role="listbox"
            className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover shadow-md"
          >
            <div className="flex items-center justify-end gap-1.5 border-b border-border/50 px-3 py-1.5 text-[10px] text-muted-foreground">
              <Kbd>↑↓</Kbd>
              <span>navigate</span>
              <span className="text-border">·</span>
              <Kbd>↵</Kbd>
              <span>insert</span>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {flat.length === 0 ? (
                <p className="px-3 py-4 text-center text-[12px] text-muted-foreground">
                  No matches
                </p>
              ) : (
                indexedGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-medium text-muted-foreground">
                      {group.label}
                    </p>
                    {group.items.map((item) => {
                      const active = item.index === activeIndex
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={active}
                          data-index={item.index}
                          onMouseEnter={() => setActiveIndex(item.index)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            apply(
                              item.token,
                              item.category === "saved" ? "replace" : "insert"
                            )
                          }
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-1.5 text-left text-[13px]",
                            active
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted/50"
                          )}
                        >
                          <span className="w-10 shrink-0 text-[10px] text-muted-foreground capitalize">
                            {item.category}
                          </span>
                          <span className="font-code min-w-0 flex-1 truncate">
                            {item.token}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-stretch border-l border-border/60">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 gap-1.5 rounded-none px-3 text-[12.5px] text-muted-foreground"
            >
              <CalendarClockIcon className="size-3.5" />
              <span className="hidden sm:inline">{rangeLabel}</span>
              <ChevronDownIcon className="size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Time range
            </DropdownMenuLabel>
            {RANGES.filter((r) => r.group === "Quick").map((r) => (
              <DropdownMenuItem
                key={r.value}
                onClick={() => onRangeChange(r.value)}
              >
                {r.label}
                {r.value === range ? (
                  <CheckIcon className="ml-auto size-3.5 text-primary" />
                ) : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {RANGES.filter((r) => r.group === "Long").map((r) => (
              <DropdownMenuItem
                key={r.value}
                onClick={() => onRangeChange(r.value)}
              >
                {r.label}
                {r.value === range ? (
                  <CheckIcon className="ml-auto size-3.5 text-primary" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleRun}
          className="h-10 rounded-none rounded-r-md px-4"
        >
          <ZapIcon className="size-3.5" />
          Run
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
          className="font-code inline-flex items-center gap-1 rounded-sm border border-border/60 bg-muted/40 py-0.5 pr-1 pl-1.5 text-[11px]"
        >
          <span className="text-muted-foreground">{c.label}:</span>
          {c.value}
        </span>
      ))}
      <Button variant="ghost" size="xs" className="h-6 text-[11px] text-muted-foreground">
        <BookmarkIcon className="size-3" />
        Save
      </Button>
    </div>
  )
}
