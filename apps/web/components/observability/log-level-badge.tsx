import { cn } from "@/lib/utils"
import { LOG_LEVEL_BADGE } from "@/lib/log-levels"
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
        "inline-flex h-6 min-w-[3.75rem] items-center justify-center rounded-sm px-2.5 text-[11px] font-semibold tracking-wide uppercase",
        LOG_LEVEL_BADGE[level],
        className
      )}
    >
      {level}
    </span>
  )
}
