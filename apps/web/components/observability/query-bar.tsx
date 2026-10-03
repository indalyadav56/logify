"use client"

import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type QueryBarProps = {
  value: string
  onChange: (value: string) => void
  range: string
  onRangeChange: (value: string) => void
  onRun?: () => void
  className?: string
}

export function QueryBar({ value, onChange, range, onRangeChange, onRun, className }: QueryBarProps) {
  return (
    <form onSubmit={e => { e.preventDefault(); onRun?.() }} className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Search logs" placeholder="Search log messages…" value={value} onChange={e => onChange(e.target.value)} className="h-10 pl-10 shadow-none" />
      </div>
      <div className="flex gap-3">
        <Select value={range} onValueChange={onRangeChange}>
          <SelectTrigger aria-label="Time range" className="h-10 w-full min-w-[170px] rounded-lg border-border bg-white sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent className="rounded-lg">
            {[['5m', 'Last 5 minutes'], ['15m', 'Last 15 minutes'], ['30m', 'Last 30 minutes'], ['1h', 'Last hour'], ['6h', 'Last 6 hours'], ['24h', 'Last 24 hours'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days']].map(([v, label]) => <SelectItem key={v} value={v} className="rounded-md">{label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button type="submit" className="h-10 px-5 shadow-none">Search</Button>
      </div>
    </form>
  )
}

export function QueryBarChips() { return null }
