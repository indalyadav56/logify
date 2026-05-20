"use client"

import * as React from "react"
import {
  CopyIcon,
  GripVerticalIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DashboardWidget } from "@/lib/dashboards/types"

export function DashboardWidgetFrame({
  widget,
  editMode,
  selected,
  onSelect,
  onDuplicate,
  onRemove,
  children,
}: {
  widget: DashboardWidget
  editMode: boolean
  selected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onRemove: () => void
  children: React.ReactNode
}) {
  return (
    <article
      onClick={editMode ? onSelect : undefined}
      className={cn(
        "group/widget relative flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow",
        editMode && "cursor-pointer",
        selected
          ? "border-primary ring-2 ring-primary/25"
          : "border-border hover:border-border/80"
      )}
      style={{
        gridColumn: `${widget.x} / span ${widget.w}`,
        gridRow: `${widget.y} / span ${widget.h}`,
      }}
    >
      {editMode && selected ? (
        <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between gap-2 border-b border-primary/20 bg-primary/5 px-2 py-1">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-primary">
            <GripVerticalIcon className="size-3 opacity-60" />
            {widget.w} × {widget.h}
          </span>
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate()
              }}
              aria-label="Duplicate widget"
            >
              <CopyIcon className="size-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="size-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontalIcon className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={onRemove}
                >
                  <Trash2Icon className="size-3.5" />
                  Remove widget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : null}

      <header
        className={cn(
          "flex shrink-0 items-center justify-between gap-2 border-b border-border/50 px-3 py-2",
          editMode && selected && "pt-8"
        )}
      >
        <h3 className="truncate text-[12px] font-semibold text-foreground">
          {widget.title}
        </h3>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden p-3">{children}</div>
    </article>
  )
}
