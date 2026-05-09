import { LogTable } from '@/components/log/LogTable'
import { LogDetailPanel } from '@/components/log/LogDetailPanel'
import { useLogExplorerStore } from '@/store/logExplorerStore'
import { useEffect } from 'react'
import { QueryToolbar } from '@/components/log/QueryToolbar'
import LogHeader from '@/components/log/LogHeader'

export default function LogsPage() {
  const selectedLog = useLogExplorerStore((s) => s.selectedLog)
  const fetchLogs = useLogExplorerStore((s) => s.fetchLogs)

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
   <main className='h-screen overflow-hidden'>
    <LogHeader/>
    <QueryToolbar/>
    <LogTable/>
   </main>
  )
}