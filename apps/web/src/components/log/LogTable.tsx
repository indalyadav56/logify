import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useMemo } from 'react'
import { useLogExplorerStore, getFilteredLogs, selectTotalPages } from '@/store/logExplorerStore'
import { LogRow } from './LogRow'

export function LogTable() {
  const allLogs = useLogExplorerStore((s) => s.allLogs)
  const searchQuery = useLogExplorerStore((s) => s.searchQuery)
  const filters = useLogExplorerStore((s) => s.filters)
  const timeRange = useLogExplorerStore((s) => s.timeRange)
  const currentPage = useLogExplorerStore((s) => s.currentPage)
  const pageSize = useLogExplorerStore((s) => s.pageSize)

  const logs = useMemo(() => {
    const filtered = getFilteredLogs(allLogs, searchQuery, filters, timeRange)
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [allLogs, searchQuery, filters, timeRange, currentPage, pageSize])

  const selectedLog = useLogExplorerStore((s) => s.selectedLog)
  const setSelectedLog = useLogExplorerStore((s) => s.setSelectedLog)
  const setCurrentPage = useLogExplorerStore((s) => s.setCurrentPage)
  const totalPages = useLogExplorerStore(selectTotalPages)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="w-0 p-0" />
              <TableHead className="w-[160px] py-2 pl-3 text-[12px] font-medium text-muted-foreground">timestamp</TableHead>
              <TableHead className="relative w-[70px] px-3 py-2 text-[12px] font-medium text-muted-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-px before:bg-border">status</TableHead>
              <TableHead className="relative px-3 py-2 text-[12px] font-medium text-muted-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-px before:bg-border">
                Log message <span className="text-muted-foreground/60">&#9432;</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <LogRow
                key={log.id}
                log={log}
                isSelected={selectedLog?.id === log.id}
                onSelect={() => setSelectedLog(log)}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
