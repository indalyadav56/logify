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
        "flex min-h-0 w-full flex-col border-r border-sidebar-border bg-sidebar font-sans text-sm",
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-sidebar-foreground">
          {title}
          {totalSelected > 0 ? (
            <span className="tabular-nums-lining inline-flex h-[18px] min-w-5 items-center justify-center rounded-md bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
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

      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facets…"
            aria-label="Search facets"
            className="h-9 bg-background pl-8 text-[12.5px]"
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

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors duration-150 ease-out hover:bg-sidebar-accent/50"
      >
        {open ? (
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-3.5 text-muted-foreground" />
        )}
        <span className="text-[12.5px] font-semibold tracking-tight text-sidebar-foreground">
          {group.label}
        </span>
        {selected.size > 0 ? (
          <span className="tabular-nums-lining ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">
            {selected.size}
          </span>
        ) : null}
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-3 pb-3">
            <div className="flex flex-col gap-0.5">
              {visible.map((v) => {
                const isSelected = selected.has(v.value)
                return (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => onToggle(v.value)}
                    aria-pressed={isSelected}
                    className={cn(
                      "group/facet flex h-9 items-center gap-2.5 rounded-md px-2.5 text-left text-[12.5px] transition-colors duration-150 ease-out",
                      isSelected
                        ? "bg-primary/12 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_22%,transparent)]"
                        : "text-foreground/90 hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/45 bg-background group-hover/facet:border-foreground/60"
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
                          aria-hidden="true"
                        >
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      ) : null}
                    </span>
                    {v.color ? (
                      <span
                        aria-hidden
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: v.color }}
                      />
                    ) : null}
                    <span className="flex-1 truncate text-[13px] tracking-tight text-foreground/90">
                      {v.value}
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
                className="mt-1.5 h-9 w-full justify-start rounded-md px-2.5 text-[12px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                {showAll
                  ? "Show less"
                  : `Show ${group.values.length - 6} more`}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
