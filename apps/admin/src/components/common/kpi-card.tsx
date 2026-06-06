import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  hint,
}: {
  label: string
  value: string | number
  delta?: number
  icon: LucideIcon
  hint?: string
}) {
  const up = (delta ?? 0) >= 0
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">
            {value}
          </div>
          {delta !== undefined && (
            <div
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                up ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {up ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {Math.abs(delta).toFixed(1)}%
              {hint && <span className="text-muted-foreground">{hint}</span>}
            </div>
          )}
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-foreground">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}
