"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronRightIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type FacetValue = {
  value: string
  count: number
  color?: string
}

export type FacetGroup = {
  id: string
  label: string
  values: FacetValue[]
  pinned?: boolean
}

type Selection = Record<string, Set<string>>

export type FacetsProps = {
  groups: FacetGroup[]
  selection: Selection
  onSelectionChange: (next: Selection) => void
  className?: string
  title?: string
}

export function Facets({
  groups,
  selection,
  onSelectionChange,
  className,
  title = "Filters",
}: FacetsProps) {
  const [search, setSearch] = React.useState("")

  const filteredGroups = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map((g) => ({
        ...g,
        values: g.values.filter(
          (v) =>
            v.value.toLowerCase().includes(q) ||
            g.label.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.values.length > 0)
  }, [groups, search])

  const toggleValue = (groupId: string, value: string) => {
    const next: Selection = { ...selection }
    const set = new Set(next[groupId] ?? [])
    if (set.has(value)) set.delete(value)
    else set.add(value)
    if (set.size === 0) delete next[groupId]
    else next[groupId] = set
    onSelectionChange(next)
  }

  const clearAll = () => onSelectionChange({})

  const totalSelected = Object.values(selection).reduce(
    (acc, s) => acc + s.size,
    0
  )

  return (
    <aside
      className={cn(
        "flex min-h-0 w-full flex-col border-r bg-sidebar/30 text-sm",
        className
      )}
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/60 px-3">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold tracking-tight">
          {title}
          {totalSelected > 0 ? (
            <span className="inline-flex h-[18px] items-center rounded bg-primary px-1.5 font-mono text-[11px] font-semibold text-primary-foreground tabular-nums">
              {totalSelected}
            </span>
          ) : null}
        </h3>
        {totalSelected > 0 ? (
          <Button
            variant="ghost"
            size="xs"
            className="h-7 text-[12px] text-muted-foreground hover:text-foreground"
            onClick={clearAll}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <div className="shrink-0 border-b border-border/60 px-2 py-2">
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facets"
            className="h-8 pl-8 text-[12.5px]"
          />
          {search ? (
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute top-1/2 right-1 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              <XIcon />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {filteredGroups.map((g) => (
          <FacetGroupBlock
            key={g.id}
            group={g}
            selected={selection[g.id] ?? new Set()}
            onToggle={(v) => toggleValue(g.id, v)}
          />
        ))}
      </div>
    </aside>
  )
}

function FacetGroupBlock({
  group,
  selected,
  onToggle,
}: {
  group: FacetGroup
  selected: Set<string>
  onToggle: (v: string) => void
}) {
  const [open, setOpen] = React.useState(group.pinned !== false)
  const [showAll, setShowAll] = React.useState(false)

  const visible = showAll ? group.values : group.values.slice(0, 6)
  const hasMore = group.values.length > 6

  const total = group.values.reduce((a, v) => a + v.count, 0)

  return (
    <div className="border-b border-border/40 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-left transition-colors hover:bg-muted/40"
      >
        {open ? (
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-3.5 text-muted-foreground" />
        )}
        <span className="text-[12.5px] font-semibold tracking-tight">
          {group.label}
        </span>
        <span className="ml-auto font-mono text-[11px] font-medium text-muted-foreground tabular-nums">
          {selected.size > 0 ? `${selected.size}/` : ""}
          {formatCount(total)}
        </span>
      </button>

      {open ? (
        <div className="px-1.5 pb-2">
          <div className="flex flex-col gap-px">
            {visible.map((v) => {
              const isSelected = selected.has(v.value)
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => onToggle(v.value)}
                  className={cn(
                    "group/facet flex h-7 items-center gap-2 rounded px-2 text-left text-[12.5px] transition-colors",
                    isSelected
                      ? "bg-primary/10 text-foreground"
                      : "text-foreground/85 hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background group-hover/facet:border-foreground/50"
                    )}
                  >
                    {isSelected ? (
                      <svg
                        viewBox="0 0 12 12"
                        className="size-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    ) : null}
                  </span>
                  {v.color ? (
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: v.color }}
                    />
                  ) : null}
                  <span className="flex-1 truncate font-mono text-[12px]">
                    {v.value}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                    {formatCount(v.count)}
                  </span>
                </button>
              )
            })}
          </div>
          {hasMore ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setShowAll((s) => !s)}
              className="mt-1 h-7 w-full justify-start px-2 text-[12px] text-muted-foreground hover:text-foreground"
            >
              {showAll
                ? "Show less"
                : `Show ${group.values.length - 6} more`}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(n)
}
