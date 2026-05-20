import type { LogLevel } from "./mock-data"

/** Recharts fills — distinct hues for volume stacks */
export const LOG_LEVEL_CHART: Record<LogLevel, string> = {
  trace: "oklch(0.55 0.02 252)",
  debug: "oklch(0.58 0.1 245)",
  info: "oklch(0.62 0.12 228)",
  warn: "oklch(0.72 0.14 82)",
  error: "oklch(0.6 0.18 25)",
  fatal: "oklch(0.58 0.14 305)",
}

/** Dots and thin row accent bars */
export const LOG_LEVEL_INDICATOR: Record<LogLevel, string> = {
  trace: "bg-muted-foreground/45",
  debug: "bg-sky-500/80",
  info: "bg-primary/90",
  warn: "bg-amber-500/85",
  error: "bg-destructive/90",
  fatal: "bg-violet-500/80",
}

/** Solid left-edge bar on log table rows (Dynatrace-style) */
export const LOG_LEVEL_ROW_BAR: Record<LogLevel, string> = {
  trace: "bg-muted-foreground/35",
  debug: "bg-sky-500",
  info: "bg-sky-400",
  warn: "bg-amber-500",
  error: "bg-red-600",
  fatal: "bg-violet-600",
}

export const LOG_LEVEL_TEXT: Record<LogLevel, string> = {
  trace: "text-muted-foreground",
  debug: "text-sky-700 dark:text-sky-300",
  info: "text-primary",
  warn: "text-amber-800 dark:text-amber-200",
  error: "text-destructive",
  fatal: "text-violet-800 dark:text-violet-200",
}

/** Flat severity pills — light fill + saturated label (observability table style) */
export const LOG_LEVEL_BADGE: Record<LogLevel, string> = {
  trace: "bg-muted text-muted-foreground",
  debug: "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300",
  info: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  warn: "border border-amber-500/40 text-amber-800 bg-amber-50/50 dark:border-amber-500/30 dark:text-amber-400 dark:bg-amber-950/20",
  error: "bg-red-100/80 text-red-800 dark:bg-red-950/80 dark:text-red-300",
  fatal: "bg-violet-100 text-violet-900 dark:bg-violet-950/70 dark:text-violet-200",
}
