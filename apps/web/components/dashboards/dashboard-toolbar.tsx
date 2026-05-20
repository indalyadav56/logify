"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutGridIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  Share2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DASHBOARD_TIME_RANGES } from "@/lib/dashboards/widget-catalog"

export function DashboardToolbar({
  name,
  editMode,
  onEditModeChange,
  onNameChange,
  timeRange,
  onTimeRangeChange,
  autoRefresh,
  onAutoRefreshChange,
  onRefresh,
  onAddWidget,
  loading,
}: {
  name: string
  editMode: boolean
  onEditModeChange: (v: boolean) => void
  onNameChange: (name: string) => void
  timeRange: string
  onTimeRangeChange: (range: string) => void
  autoRefresh: boolean
  onAutoRefreshChange: (v: boolean) => void
  onRefresh: () => void
  onAddWidget: () => void
  loading?: boolean
}) {
  const [editingTitle, setEditingTitle] = React.useState(false)
  const [titleDraft, setTitleDraft] = React.useState(name)

  React.useEffect(() => {
    setTitleDraft(name)
  }, [name])

  const share = () => {
    const url = window.location.href
    void navigator.clipboard.writeText(url)
    toast.success("Dashboard link copied")
  }

  const shiftRange = (dir: -1 | 1) => {
    const idx = DASHBOARD_TIME_RANGES.findIndex((r) => r.id === timeRange)
    const next = DASHBOARD_TIME_RANGES[idx + dir]
    if (next) onTimeRangeChange(next.id)
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-border bg-card px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {editingTitle && editMode ? (
            <Input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                onNameChange(titleDraft.trim() || name)
                setEditingTitle(false)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onNameChange(titleDraft.trim() || name)
                  setEditingTitle(false)
                }
              }}
              className="h-8 max-w-xs text-[14px] font-semibold"
              autoFocus
            />
          ) : (
            <button
              type="button"
              className="flex min-w-0 items-center gap-2 text-left"
              onClick={() => editMode && setEditingTitle(true)}
            >
              <LayoutGridIcon className="size-4 shrink-0 text-primary" />
              <span className="truncate text-[14px] font-semibold tracking-tight">
                {name}
              </span>
              {editMode ? (
                <PencilIcon className="size-3 shrink-0 text-muted-foreground" />
              ) : null}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editMode ? "secondary" : "outline"}
                size="sm"
                className="h-8 text-[12px]"
                onClick={() => onEditModeChange(!editMode)}
              >
                {editMode ? "Done editing" : "Edit"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Arrange widgets and rename</TooltipContent>
          </Tooltip>

          {editMode ? (
            <Button
              size="sm"
              className="h-8 gap-1 text-[12px]"
              onClick={onAddWidget}
            >
              <PlusIcon className="size-3.5" />
              Widget
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-[12px]"
            onClick={share}
          >
            <Share2Icon className="size-3.5" />
            Share
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-md border border-border bg-muted/20 p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7"
            onClick={() => shiftRange(-1)}
            aria-label="Earlier time range"
          >
            <ChevronLeftIcon className="size-3.5" />
          </Button>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="h-7 min-w-[140px] border-0 bg-transparent text-[12px] shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DASHBOARD_TIME_RANGES.map((r) => (
                <SelectItem key={r.id} value={r.id} className="text-[12px]">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7"
            onClick={() => shiftRange(1)}
            aria-label="Later time range"
          >
            <ChevronRightIcon className="size-3.5" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span>Auto-refresh</span>
            <Switch
              checked={autoRefresh}
              onCheckedChange={onAutoRefreshChange}
            />
          </label>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 gap-1 text-[12px]", loading && "opacity-70")}
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCwIcon
              className={cn("size-3.5", loading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  )
}
