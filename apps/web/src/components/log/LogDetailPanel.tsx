import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useLogExplorerStore } from '@/store/logExplorerStore'
import { format } from 'date-fns'
import {
  RiSearchLine,
  RiPlayLine,
  RiRouteLine,
  RiUser3Line,
  RiInformationLine,
  RiFileCopyLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiSparklingLine,
  RiCloseLine,
} from '@remixicon/react'
import type { LogLevel } from '@/types/log'
import { cn } from '@/lib/utils'

const LEVEL_BADGE_STYLES: Record<LogLevel, string> = {
  ERROR: 'bg-red-500/15 text-red-600 dark:text-red-400',
  WARN: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  INFO: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  DEBUG: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  NONE: 'bg-gray-500/15 text-gray-500',
}

const LEVEL_ICON_COLORS: Record<LogLevel, string> = {
  ERROR: 'text-red-500',
  WARN: 'text-amber-500',
  INFO: 'text-blue-500',
  DEBUG: 'text-gray-400',
  NONE: 'text-gray-500',
}

function CollapsibleSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-1.5 py-2 text-sm font-medium hover:text-foreground">
        {isOpen ? <RiArrowDownSLine className="size-4" /> : <RiArrowRightSLine className="size-4" />}
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}

function FieldRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-1 text-xs">
      <span className="w-[140px] shrink-0 text-muted-foreground">{label}</span>
      <span className={cn('flex-1 break-all', mono && 'font-mono')}>{value}</span>
    </div>
  )
}

export function LogDetailPanel() {
  const selectedLog = useLogExplorerStore((s) => s.selectedLog)
  const setSelectedLog = useLogExplorerStore((s) => s.setSelectedLog)
  const [detailSearch, setDetailSearch] = useState('')

  if (!selectedLog) return null

  const ts = format(selectedLog.timestamp, 'MMM d, HH:mm:ss')
  const ms = String(selectedLog.timestamp.getMilliseconds()).padStart(3, '0')

  const jsonContent = {
    timestamp: selectedLog.fields.timestamp,
    level: selectedLog.level,
    thread: selectedLog.thread,
    logger: selectedLog.logger,
    message: selectedLog.message,
    context: selectedLog.fields.context,
  }

  return (
    <div className="relative flex h-full w-[480px] shrink-0 flex-col border-l bg-background">
      <ScrollArea className="h-full">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 pr-8">
            <div className={cn('mt-1 size-6 flex items-center justify-center', LEVEL_ICON_COLORS[selectedLog.level])}>
              <RiInformationLine className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {ts}
                <span className="text-muted-foreground">.{ms}</span>
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">status:</span>
                <Badge variant="secondary" className={cn('text-[10px]', LEVEL_BADGE_STYLES[selectedLog.level])}>
                  {selectedLog.level}
                </Badge>
                <span className="text-xs text-muted-foreground">loglevel:</span>
                <Badge variant="secondary" className={cn('text-[10px]', LEVEL_BADGE_STYLES[selectedLog.level])}>
                  {selectedLog.level}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedLog(null)}
            >
              <RiCloseLine />
              <span className="sr-only">Close</span>
            </Button>
          </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <RiPlayLine className="size-3.5" />
                Show surrounding logs
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <RiRouteLine className="size-3.5" />
                View trace
              </Button>
            </div>
            <div className="mt-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                <RiUser3Line className="size-3.5" />
                View user session
              </Button>
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <RiSearchLine className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search details"
                value={detailSearch}
                onChange={(e) => setDetailSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>

            <Separator className="my-4" />

            {/* Log Message */}
            <CollapsibleSection title="Log message &#9432;">
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono text-xs leading-relaxed break-all">{selectedLog.message}</p>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => navigator.clipboard.writeText(selectedLog.message)}
                  >
                    <RiFileCopyLine className="size-3" />
                  </Button>
                </div>
              </div>
            </CollapsibleSection>

            <Separator className="my-3" />

            {/* Content - JSON / RAW */}
            <CollapsibleSection title="Content">
              <Tabs defaultValue="json">
                <TabsList className="h-7">
                  <TabsTrigger value="json" className="text-xs px-3 py-1">
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="text-xs px-3 py-1">
                    RAW
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="json" className="mt-2">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {JSON.stringify(jsonContent, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="mt-2">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {`${selectedLog.fields.timestamp} ${selectedLog.level} [${selectedLog.thread}] ${selectedLog.logger} - ${selectedLog.message}`}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>

              {/* MDC */}
              {Object.keys(selectedLog.mdc).length > 0 && (
                <div className="mt-3">
                  <CollapsibleSection title="mdc" defaultOpen={false}>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.mdc, null, 2)}
                      </pre>
                    </div>
                  </CollapsibleSection>
                </div>
              )}

              {/* Stack trace */}
              {selectedLog.stackTrace && (
                <div className="mt-3">
                  <CollapsibleSection title="Stack trace" defaultOpen={false}>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <pre className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap text-red-500/80">
                        {selectedLog.stackTrace}
                      </pre>
                    </div>
                  </CollapsibleSection>
                </div>
              )}
            </CollapsibleSection>

            <Separator className="my-3" />

            {/* Topology */}
            <CollapsibleSection title="Topology">
              <div className="space-y-0">
                <FieldRow label="dt.source_entity" value={`HOST-${selectedLog.traceId.toUpperCase().slice(0, 16)}`} mono />
                <FieldRow label="dt.entity.host" value={`HOST-${selectedLog.traceId.toUpperCase().slice(0, 16)}`} mono />
              </div>
            </CollapsibleSection>

            <Separator className="my-3" />

            {/* Fields */}
            <CollapsibleSection title="Fields">
              <div className="space-y-0">
                <FieldRow label="timestamp" value={format(selectedLog.timestamp, "MMM d, HH:mm:ss.SSS")} />
                <FieldRow label="host.name" value={selectedLog.host} mono />
                <FieldRow label="service.name" value={selectedLog.service} mono />
                <FieldRow label="k8s.namespace" value={selectedLog.k8sNamespace} mono />
                <FieldRow label="k8s.pod.name" value={selectedLog.k8sPodName} mono />
                <FieldRow label="k8s.node.name" value={selectedLog.k8sNodeName} mono />
                <FieldRow label="k8s.workload.kind" value={selectedLog.k8sWorkloadKind} mono />
                <FieldRow label="k8s.workload.name" value={selectedLog.k8sWorkloadName} mono />
                <FieldRow label="trace.id" value={selectedLog.traceId} mono />
                <FieldRow label="span.id" value={selectedLog.spanId} mono />
                {selectedLog.statusCode && (
                  <FieldRow label="http.status_code" value={String(selectedLog.statusCode)} mono />
                )}
                {selectedLog.duration !== undefined && (
                  <FieldRow label="duration" value={`${selectedLog.duration}ms`} mono />
                )}
              </div>
            </CollapsibleSection>

            <Separator className="my-3" />

            {/* Explain log button */}
            <Button variant="outline" className="w-full gap-2 text-sm">
              <RiSparklingLine className="size-4" />
              Explain log
            </Button>
          </div>
        </ScrollArea>
    </div>
  )
}
