import { cn } from "@/lib/utils"
import { LOG_LEVEL_INDICATOR, LOG_LEVEL_TEXT } from "@/lib/log-levels"
import type { LogLevel } from "@/lib/mock-data"

export function LogLevelBadge({
  level,
  className,
}: {
  level: LogLevel
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide",
        LOG_LEVEL_TEXT[level],
        className
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", LOG_LEVEL_INDICATOR[level])}
      />
      {level}
    </span>
  )
}
