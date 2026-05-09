import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useLogExplorerStore } from '@/store/logExplorerStore'
import type { TimeRange } from '@/types/log'
import {
  RiFilter3Line,
  RiPlayFill,
  RiCloseLine,
  RiPushpin2Line,
} from '@remixicon/react'
import { cn } from '@/lib/utils'

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '15m': 'Last 15 minutes',
  '1h': 'Last 1 hour',
  '4h': 'Last 4 hours',
  '12h': 'Last 12 hours',
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
}

const FIELD_SUGGESTIONS = [
  { value: 'service', desc: 'Log source service name' },
  { value: 'severity', desc: 'Log level (ERROR, WARN, …)' },
  { value: 'host', desc: 'Hostname' },
  { value: 'k8s.namespace', desc: 'Kubernetes namespace' },
  { value: 'k8s.pod.name', desc: 'Kubernetes pod name' },
  { value: 'k8s.container.name', desc: 'Container name' },
  { value: 'trace_id', desc: 'Distributed trace ID' },
  { value: 'request_id', desc: 'Request correlation ID' },
]

const OPERATOR_SUGGESTIONS = [
  { value: '*', desc: 'Wildcard match' },
  { value: '~', desc: 'Fuzzy / contains' },
  { value: '=', desc: 'Equals' },
  { value: '!=', desc: 'Not equals' },
  { value: 'AND', desc: 'Logical AND' },
  { value: 'OR', desc: 'Logical OR' },
  { value: 'NOT', desc: 'Logical NOT' },
]

interface Token {
  type: 'string' | 'op' | 'keyword' | 'field' | 'text'
  value: string
}

function tokenizeQuery(query: string): Token[] {
  const tokens: Token[] = []
  const re = /("[^"]*"|'[^']*')|(\b(?:AND|OR|NOT)\b)|(!=|>=|<=|=|~|\*|:|>|<)|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(query)) !== null) {
    if (m[1]) tokens.push({ type: 'string', value: m[1] })
    else if (m[2]) tokens.push({ type: 'keyword', value: m[2] })
    else if (m[3]) tokens.push({ type: 'op', value: m[3] })
    else if (m[4]) tokens.push({ type: 'field', value: m[4] })
  }
  return tokens
}

function HighlightedQuery({ query }: { query: string }) {
  const tokens = tokenizeQuery(query)
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden font-mono text-[13px]">
      {tokens.map((t, i) => (
        <span
          key={i}
          className={cn(
            t.type === 'string' && 'text-pink-600 dark:text-pink-400',
            t.type === 'op' && 'text-muted-foreground',
            t.type === 'keyword' && 'font-semibold text-purple-600 dark:text-purple-400',
            t.type === 'field' && 'text-blue-600 dark:text-blue-400',
          )}
        >
          {t.value}
        </span>
      ))}
    </div>
  )
}

function ActiveFilterCount() {
  const filters = useLogExplorerStore((s) => s.filters)
  const count =
    filters.levels.size +
    filters.services.size +
    filters.k8sNamespaces.size +
    filters.k8sNodes.size +
    filters.k8sWorkloadKinds.size
  if (count === 0) return null
  return (
    <Badge variant="default" className="ml-1 size-5 rounded-full p-0 text-[10px]">
      {count}
    </Badge>
  )
}

export function QueryToolbar() {
  const searchQuery = useLogExplorerStore((s) => s.searchQuery)
  const setSearchQuery = useLogExplorerStore((s) => s.setSearchQuery)
  const timeRange = useLogExplorerStore((s) => s.timeRange)
  const setTimeRange = useLogExplorerStore((s) => s.setTimeRange)
  const clearFilters = useLogExplorerStore((s) => s.clearFilters)

  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [draft, setDraft] = useState(searchQuery)

  const appendToDraft = (token: string) => {
    const sep = draft.length > 0 && !draft.endsWith(' ') ? ' ' : ''
    setDraft(draft + sep + token + ' ')
  }

  const submit = () => {
    setSearchQuery(draft.trim())
    setOpen(false)
  }

  const clearQuery = () => {
    setDraft('')
    setSearchQuery('')
  }

  return (
    <div className="flex items-center gap-2 border-b px-3 py-2">
      {/* Query input area */}
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (o) setDraft(searchQuery)
        }}
      >
        <PopoverTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            className="group flex min-w-0 flex-1 cursor-text items-center gap-2 rounded-md border bg-background px-2 py-1 hover:border-muted-foreground/50 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring"
          >
            <RiFilter3Line className="size-3.5 shrink-0 text-muted-foreground" />
            {searchQuery ? (
              <HighlightedQuery query={searchQuery} />
            ) : (
              <span className="flex-1 truncate text-[13px] text-muted-foreground">
                Search logs… try <span className="font-mono">service:checkout severity:ERROR</span>
              </span>
            )}
            <ActiveFilterCount />
            <button
              type="button"
              aria-label={pinned ? 'Unpin query' : 'Pin query'}
              onClick={(e) => {
                e.stopPropagation()
                setPinned((p) => !p)
              }}
              className={cn(
                'shrink-0 rounded p-0.5 transition-colors hover:text-foreground',
                pinned ? 'text-blue-500' : 'text-muted-foreground',
              )}
            >
              <RiPushpin2Line className={cn('size-3.5', pinned && 'rotate-45')} />
            </button>
            <button
              type="button"
              aria-label="Clear query"
              onClick={(e) => {
                e.stopPropagation()
                clearQuery()
              }}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <RiCloseLine className="size-4" />
            </button>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[--radix-popover-trigger-width] min-w-[420px] rounded-2xl p-0"
          align="start"
        >
          <Command shouldFilter>
            <CommandInput
              placeholder="Type a field, operator, or value…"
              value={draft}
              onValueChange={setDraft}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submit()
                }
              }}
            />
            <CommandList>
              <CommandEmpty>No suggestions — press Enter to run as full-text.</CommandEmpty>
              <CommandGroup heading="Fields">
                {FIELD_SUGGESTIONS.map((f) => (
                  <CommandItem
                    key={f.value}
                    value={f.value}
                    onSelect={() => appendToDraft(`${f.value}:`)}
                  >
                    <span className="font-mono text-[13px] text-blue-600 dark:text-blue-400">
                      {f.value}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">{f.desc}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Operators">
                {OPERATOR_SUGGESTIONS.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    onSelect={() => appendToDraft(o.value)}
                  >
                    <span className="font-mono text-[13px] text-muted-foreground">{o.value}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{o.desc}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem value="run" onSelect={submit}>
                  <RiPlayFill className="size-3.5 text-emerald-600" />
                  <span>Run query</span>
                </CommandItem>
                <CommandItem
                  value="clear"
                  onSelect={() => {
                    clearQuery()
                    clearFilters()
                  }}
                >
                  <RiCloseLine className="size-3.5" />
                  <span>Clear all filters</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Time range selector */}
      <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
        <SelectTrigger size="sm" className="w-auto shrink-0 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((key) => (
            <SelectItem key={key} value={key}>
              {TIME_RANGE_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Run Query */}
      <Button
        size="sm"
        onClick={submit}
        className="shrink-0 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
      >
        <RiPlayFill className="size-3" />
        Run query
      </Button>
    </div>
  )
}
