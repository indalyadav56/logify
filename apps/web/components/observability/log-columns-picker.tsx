"use client"

import * as React from "react"
import { Columns3Icon, GripVerticalIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  DEFAULT_VISIBLE_COLUMN_IDS,
  mergeColumnOrder,
  type LogColumnDef,
} from "@/lib/log-columns"

export type LogColumnsPickerProps = {
  columns: LogColumnDef[]
  visibleIds: string[]
  columnOrder?: string[]
  onVisibleChange: (ids: string[]) => void
  onColumnOrderChange?: (order: string[]) => void
}

type DraftState = {
  order: string[]
  visible: Set<string>
}

function buildDefaultVisible(columns: LogColumnDef[]): string[] {
  const defaults = columns
    .filter((c) => DEFAULT_VISIBLE_COLUMN_IDS.includes(c.id))
    .map((c) => c.id)
  return defaults.length > 0 ? defaults : columns.slice(0, 1).map((c) => c.id)
}

export function LogColumnsPicker({
  columns,
  visibleIds,
  columnOrder,
  onVisibleChange,
  onColumnOrderChange,
}: LogColumnsPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [draft, setDraft] = React.useState<DraftState | null>(null)
  const [dragId, setDragId] = React.useState<string | null>(null)

  const fullOrder = React.useMemo(
    () => mergeColumnOrder(columnOrder ?? visibleIds, columns),
    [columnOrder, visibleIds, columns]
  )

  const columnById = React.useMemo(
    () => new Map(columns.map((c) => [c.id, c])),
    [columns]
  )

  const hiddenCount = columns.length - visibleIds.length

  const openDialog = () => {
    setDraft({
      order: [...fullOrder],
      visible: new Set(visibleIds),
    })
    setSearch("")
    setOpen(true)
  }

  const closeDialog = () => {
    setOpen(false)
    setDraft(null)
    setSearch("")
    setDragId(null)
  }

  const filteredOrder = React.useMemo(() => {
    if (!draft) return []
    const q = search.trim().toLowerCase()
    if (!q) return draft.order
    return draft.order.filter((id) => {
      const col = columnById.get(id)
      if (!col) return false
      return col.label.toLowerCase().includes(q)
    })
  }, [draft, search, columnById])

  const allChecked =
    draft != null &&
    draft.order.length > 0 &&
    draft.order.every((id) => draft.visible.has(id))
  const noneChecked =
    draft != null && draft.order.every((id) => !draft.visible.has(id))
  const someChecked = draft != null && !allChecked && !noneChecked

  const setAllVisible = (checked: boolean) => {
    if (!draft) return
    if (checked) {
      setDraft({
        order: draft.order,
        visible: new Set(draft.order),
      })
    } else {
      const first = draft.order[0]
      setDraft({
        order: draft.order,
        visible: first ? new Set([first]) : new Set(),
      })
    }
  }

  const toggleColumn = (id: string, checked: boolean) => {
    if (!draft) return
    const next = new Set(draft.visible)
    if (checked) {
      next.add(id)
    } else {
      if (next.size <= 1) return
      next.delete(id)
    }
    setDraft({ ...draft, visible: next })
  }

  const handleApply = () => {
    if (!draft) return
    const visibleOrdered = draft.order.filter((id) => draft.visible.has(id))
    if (visibleOrdered.length === 0) return
    onColumnOrderChange?.(draft.order)
    onVisibleChange(visibleOrdered)
    closeDialog()
  }

  const handleReset = () => {
    const defaults = buildDefaultVisible(columns)
    const order = mergeColumnOrder(
      [...DEFAULT_VISIBLE_COLUMN_IDS, ...columns.map((c) => c.id)],
      columns
    )
    setDraft({
      order,
      visible: new Set(defaults),
    })
  }

  const reorder = (fromId: string, toId: string) => {
    if (!draft || fromId === toId) return
    const order = [...draft.order]
    const fromIdx = order.indexOf(fromId)
    const toIdx = order.indexOf(toId)
    if (fromIdx === -1 || toIdx === -1) return
    order.splice(fromIdx, 1)
    order.splice(toIdx, 0, fromId)
    setDraft({ ...draft, order })
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="h-8 gap-1.5 rounded-md px-2.5 text-[12px] text-muted-foreground transition-colors duration-150 hover:bg-muted/80 hover:text-foreground"
        onClick={openDialog}
      >
        <Columns3Icon className="size-3.5" />
        {hiddenCount > 0 ? (
          <span className="tabular-nums-lining">
            {hiddenCount} column{hiddenCount === 1 ? "" : "s"} hidden
          </span>
        ) : (
          <span>Columns</span>
        )}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) closeDialog()
        }}
      >
        <DialogContent
          showCloseButton
          className={cn(
            "flex h-[min(520px,85vh)] w-full max-w-[400px] flex-col gap-0 overflow-hidden rounded-lg p-0",
            "border border-border bg-card shadow-lg sm:max-w-[400px]",
            "!grid-cols-none !grid-rows-none"
          )}
        >
          <DialogTitle className="sr-only">Columns</DialogTitle>

          {/* Header */}
          <header className="shrink-0 border-b border-border px-5 py-3.5 pr-12">
            <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
              Columns
            </h2>
          </header>

          {/* Toolbar */}
          <div className="shrink-0 border-b border-border bg-muted/10 px-5 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex shrink-0 cursor-pointer items-center gap-2.5 text-[13px] font-medium text-foreground">
                <Checkbox
                  checked={
                    allChecked ? true : someChecked ? "indeterminate" : false
                  }
                  onCheckedChange={(v) => setAllVisible(v === true)}
                  aria-label="Show or hide all columns"
                />
                <span className="whitespace-nowrap">Show/hide all</span>
              </label>
              <div className="relative min-w-0 flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="h-8 w-full bg-background pl-8 text-[13px]"
                />
              </div>
            </div>
          </div>

          {/* Scrollable list — flex-1 + min-h-0 keeps footer from overlapping */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <ul className="py-1">
              {filteredOrder.length === 0 ? (
                <li className="px-5 py-10 text-center text-[13px] text-muted-foreground">
                  No columns match your search
                </li>
              ) : (
                filteredOrder.map((id) => {
                  const col = columnById.get(id)
                  if (!col) return null
                  const checked = draft?.visible.has(id) ?? false
                  const isDragging = dragId === id

                  return (
                    <li
                      key={id}
                      draggable
                      onDragStart={() => setDragId(id)}
                      onDragEnd={() => setDragId(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (dragId) reorder(dragId, id)
                        setDragId(null)
                      }}
                      className={cn(
                        "mx-2 flex items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 transition-colors",
                        isDragging &&
                          "border-primary/30 bg-primary/5 opacity-60",
                        !isDragging && checked && "bg-muted/30",
                        !isDragging && "hover:bg-muted/50"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          toggleColumn(id, v === true)
                        }
                        aria-label={`Toggle ${col.label}`}
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[13px]",
                          col.group === "attribute"
                            ? "font-code text-[12.5px]"
                            : "",
                          checked
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                        title={col.label}
                      >
                        {col.label}
                      </span>
                      <button
                        type="button"
                        className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground/70 hover:bg-muted hover:text-foreground active:cursor-grabbing"
                        aria-label={`Reorder ${col.label}`}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <GripVerticalIcon className="size-4" />
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>

          {/* Footer — pinned, never overlaps list */}
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-5 py-3.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2 text-[12.5px] text-muted-foreground hover:text-foreground"
              onClick={handleReset}
            >
              Reset to default
            </Button>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 text-[12.5px]"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 min-w-[72px] px-4 text-[12.5px] font-medium"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </footer>
        </DialogContent>
      </Dialog>
    </>
  )
}
