import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { useLogExplorerStore, selectTimeline } from '@/store/logExplorerStore'
import { RiEyeOffLine, RiEyeLine } from '@remixicon/react'

const chartConfig: ChartConfig = {
  INFO: { label: 'INFO', color: '#3b82f6' },
  WARN: { label: 'WARN', color: '#eab308' },
  ERROR: { label: 'ERROR', color: '#ef4444' },
  NONE: { label: 'NONE', color: '#1f2937' },
  DEBUG: { label: 'DEBUG', color: '#9ca3af' },
}

const LEVEL_COLORS: Record<string, string> = {
  INFO: '#3b82f6',
  WARN: '#eab308',
  ERROR: '#ef4444',
  NONE: '#1f2937',
  DEBUG: '#9ca3af',
}

function ChartLegend() {
  return (
    <div className="flex items-center gap-3">
      {(['INFO', 'WARN', 'ERROR', 'NONE'] as const).map((level) => (
        <div key={level} className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: LEVEL_COLORS[level] }}
          />
          <span className="text-xs text-muted-foreground">{level}</span>
        </div>
      ))}
    </div>
  )
}

export function TimelineChart() {
  const showTimeline = useLogExplorerStore((s) => s.showTimeline)
  const toggleTimeline = useLogExplorerStore((s) => s.toggleTimeline)
  const allLogs = useLogExplorerStore((s) => s.allLogs)
  const searchQuery = useLogExplorerStore((s) => s.searchQuery)
  const filters = useLogExplorerStore((s) => s.filters)
  const timeRange = useLogExplorerStore((s) => s.timeRange)

  const timeline = useMemo(
    () => selectTimeline({ allLogs, searchQuery, filters, timeRange } as Parameters<typeof selectTimeline>[0]),
    [allLogs, searchQuery, filters, timeRange],
  )

  return (
    <div className="border-b">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm font-medium">Timeseries</span>
        <div className="flex items-center gap-4">
          <ChartLegend />
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={toggleTimeline}>
            {showTimeline ? <RiEyeOffLine className="size-3.5" /> : <RiEyeLine className="size-3.5" />}
            {showTimeline ? 'Hide chart' : 'Show chart'}
          </Button>
        </div>
      </div>
      {showTimeline && (
        <div className="px-4 pb-3">
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <BarChart data={timeline} barCategoryGap="2%">
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                width={35}
                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="mb-1 font-medium">{label}</p>
                      {payload.map((entry) => (
                        <div key={entry.dataKey} className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-muted-foreground">{entry.dataKey}:</span>
                          <span className="font-medium">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )
                }}
              />
              <Bar dataKey="NONE" stackId="a" fill={LEVEL_COLORS.NONE} radius={0} />
              <Bar dataKey="DEBUG" stackId="a" fill={LEVEL_COLORS.DEBUG} radius={0} />
              <Bar dataKey="INFO" stackId="a" fill={LEVEL_COLORS.INFO} radius={0} />
              <Bar dataKey="WARN" stackId="a" fill={LEVEL_COLORS.WARN} radius={0} />
              <Bar dataKey="ERROR" stackId="a" fill={LEVEL_COLORS.ERROR} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </div>
  )
}
