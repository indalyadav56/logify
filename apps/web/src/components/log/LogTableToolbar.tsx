import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLogExplorerStore, selectFilteredCount } from '@/store/logExplorerStore'
import {
  RiSearchLine,
  RiCloseLine,
  RiGridFill,
  RiSettings3Line,
  RiDownloadLine,
  RiAlertLine,
} from '@remixicon/react'

function formatTotal(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

export function LogTableToolbar() {
  const searchQuery = useLogExplorerStore((s) => s.searchQuery)
  const setSearchQuery = useLogExplorerStore((s) => s.setSearchQuery)
  const currentPage = useLogExplorerStore((s) => s.currentPage)
  const pageSize = useLogExplorerStore((s) => s.pageSize)
  const filteredCount = useLogExplorerStore(selectFilteredCount)

  const startRecord = (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, filteredCount)

  return (
    <div className="flex items-center gap-2 border-b px-3 py-1.5">
      {/* Search input */}
      <div className="relative flex-1">
        <RiSearchLine className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search results"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-7 pl-7 pr-7 text-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <RiCloseLine className="size-3.5" />
          </button>
        )}
      </div>

      {/* Record count */}
      <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        <RiAlertLine className="size-3.5 text-amber-500" />
        <span>
          {startRecord}-{endRecord} of {formatTotal(filteredCount)} records
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Open with</span>
        <Button variant="ghost" size="icon-sm">
          <RiGridFill className="size-3.5" />
        </Button>
      </div>

      <Badge variant="outline" className="shrink-0 text-[10px]">
        18 columns hidden
      </Badge>

      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon-sm">
          <RiSettings3Line className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <RiDownloadLine className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
