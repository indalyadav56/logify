import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { RiMoreLine } from '@remixicon/react'
import type { Log, LogLevel } from '@/types/log'
import { cn } from '@/lib/utils'

const LEVEL_BAR: Record<LogLevel, string> = {
  ERROR: 'bg-red-500',
  WARN: 'bg-amber-400',
  INFO: 'bg-blue-400',
  DEBUG: 'bg-slate-400',
  NONE: 'bg-slate-300',
}

const LEVEL_BADGE: Record<LogLevel, string> = {
  ERROR: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  WARN: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400',
  INFO: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  DEBUG: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
  NONE: 'bg-slate-50 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400',
}

// Tokenize log messages so we can color numbers, URLs, quoted strings.
const TOKEN_RE = /(https?:\/\/[^\s,;:'"<>()\[\]{}]+)|("[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?\b)/g

function HighlightedMessage({ text }: { text: string }) {
  const parts: Array<{ type: 'text' | 'url' | 'string' | 'number'; value: string }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  TOKEN_RE.lastIndex = 0

  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    if (match[1]) parts.push({ type: 'url', value: match[1] })
    else if (match[2]) parts.push({ type: 'string', value: match[2] })
    else if (match[3]) parts.push({ type: 'number', value: match[3] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return (
    <>
      {parts.map((p, i) => {
        if (p.type === 'url') {
          return (
            <span key={i} className="text-sky-600 dark:text-sky-400 underline decoration-dotted">
              {p.value}
            </span>
          )
        }
        if (p.type === 'number') {
          return (
            <span key={i} className="text-pink-600 dark:text-pink-400">
              {p.value}
            </span>
          )
        }
        if (p.type === 'string') {
          return (
            <span key={i} className="text-emerald-700 dark:text-emerald-400">
              {p.value}
            </span>
          )
        }
        return <span key={i}>{p.value}</span>
      })}
    </>
  )
}

interface LogRowProps {
  log: Log
  isSelected: boolean
  onSelect: () => void
}

export function LogRow({ log, isSelected, onSelect }: LogRowProps) {
  const datePart = format(log.timestamp, 'MMM d,')
  const timePart = format(log.timestamp, 'HH:mm:ss')
  const ms = String(log.timestamp.getMilliseconds()).padStart(3, '0')

  return (
    <TableRow
      onClick={onSelect}
      className={cn(
        'group cursor-pointer border-b border-border/60 hover:bg-muted/40',
        isSelected
          ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/30 dark:bg-blue-900/10 hover:bg-blue-50/30'
          : '',
      )}
    >
      {/* Left color bar */}
      <TableCell className="relative w-0 p-0">
        <div className={cn('absolute inset-y-0 left-0 w-[3px]', LEVEL_BAR[log.level])} />
      </TableCell>

      {/* Timestamp */}
      <TableCell className="w-[160px] whitespace-nowrap py-2 pl-3 pr-4 align-top">
        <span className="font-mono text-[12px] font-semibold text-foreground">
          {datePart} {timePart}
        </span>
        <span className="font-mono text-[12px] text-muted-foreground">.{ms}</span>
      </TableCell>

      {/* Status */}
      <TableCell className="relative w-[80px] px-3 py-2 align-top before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-border">
        <span
          className={cn(
            'inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11px] font-bold tracking-wide',
            LEVEL_BADGE[log.level],
          )}
        >
          {log.level}
        </span>
      </TableCell>

      {/* Message */}
      <TableCell className="relative px-3 py-2 align-top before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-border">
        <div className="flex items-start gap-2">
          <span className="min-w-0 flex-1 break-words font-mono text-[12px] leading-relaxed text-foreground">
            <HighlightedMessage text={log.message} />
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <RiMoreLine className="size-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
