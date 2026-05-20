"use client"

import {
  ActivityIcon,
  AlignLeftIcon,
  BarChart3Icon,
  TableIcon,
  ListIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { WIDGET_CATALOG } from "@/lib/dashboards/widget-catalog"
import type { DashboardWidgetType } from "@/lib/dashboards/types"

const ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  gauge: ActivityIcon,
  chart: BarChart3Icon,
  table: TableIcon,
  list: ListIcon,
  note: AlignLeftIcon,
}

export function AddWidgetSheet({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (type: DashboardWidgetType) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(380px,100vw)]">
        <SheetHeader>
          <SheetTitle>Add widget</SheetTitle>
          <SheetDescription>
            Choose a visualization. You can resize and arrange widgets in edit
            mode.
          </SheetDescription>
        </SheetHeader>
        <ul className="mt-6 space-y-2">
          {WIDGET_CATALOG.map((item) => {
            const Icon = ICONS[item.icon] ?? ActivityIcon
            return (
              <li key={item.type}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors",
                    "hover:border-primary/40 hover:bg-primary/5"
                  )}
                  onClick={() => {
                    onPick(item.type)
                    onOpenChange(false)
                  }}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-foreground">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-muted-foreground">
                      {item.description}
                    </span>
                    <span className="mt-1.5 inline-block font-mono text-[10px] text-muted-foreground">
                      {item.defaultW}×{item.defaultH} grid
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
      </SheetContent>
    </Sheet>
  )
}
