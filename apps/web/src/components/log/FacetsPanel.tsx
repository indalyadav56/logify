import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useLogExplorerStore, selectFacets } from '@/store/logExplorerStore'
import { RiSearchLine, RiArrowDownSLine, RiArrowRightSLine, RiMoreLine } from '@remixicon/react'
import type { FacetGroup, FacetSection } from '@/types/log'

const LEVEL_COLORS: Record<string, string> = {
  ERROR: 'bg-red-500',
  WARN: 'bg-amber-500',
  INFO: 'bg-blue-500',
  DEBUG: 'bg-gray-400',
  NONE: 'bg-gray-600',
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return n.toString()
}

function FacetGroupItem({
  group,
  onToggle,
}: {
  group: FacetGroup
  onToggle: (key: string, value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
        {isOpen ? (
          <RiArrowDownSLine className="size-3.5" />
        ) : (
          <RiArrowRightSLine className="size-3.5" />
        )}
        <span className="flex-1 text-left">{group.label}</span>
        <RiMoreLine className="size-3.5 opacity-0 group-hover:opacity-100" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-1 space-y-0.5 pb-1">
          {group.items.map((item) => (
            <div
              key={item.value}
              role="button"
              tabIndex={0}
              onClick={() => onToggle(group.key, item.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(group.key, item.value) } }}
              className="flex w-full cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-muted"
            >
              <Checkbox
                checked={item.selected}
                className="size-3.5"
                tabIndex={-1}
                onCheckedChange={() => onToggle(group.key, item.value)}
              />
              {group.key === 'status' && (
                <span className={`size-2 rounded-full ${LEVEL_COLORS[item.value] ?? 'bg-gray-400'}`} />
              )}
              <span className="flex-1 truncate text-left text-foreground">{item.value}</span>
              <span className="tabular-nums text-muted-foreground">{formatCount(item.count)}</span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function FacetSectionBlock({ section, onToggle }: { section: FacetSection; onToggle: (key: string, value: string) => void }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-1 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
        {isOpen ? (
          <RiArrowDownSLine className="size-3.5" />
        ) : (
          <RiArrowRightSLine className="size-3.5" />
        )}
        {section.label}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-1 space-y-1">
          {section.groups.map((group) => (
            <FacetGroupItem key={group.key} group={group} onToggle={onToggle} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function FacetsPanel() {
  const facetSearch = useLogExplorerStore((s) => s.facetSearch)
  const setFacetSearch = useLogExplorerStore((s) => s.setFacetSearch)
  const allLogs = useLogExplorerStore((s) => s.allLogs)
  const searchQuery = useLogExplorerStore((s) => s.searchQuery)
  const filters = useLogExplorerStore((s) => s.filters)
  const timeRange = useLogExplorerStore((s) => s.timeRange)

  const facets = useMemo(
    () => selectFacets({ allLogs, searchQuery, filters, timeRange } as Parameters<typeof selectFacets>[0]),
    [allLogs, searchQuery, filters, timeRange],
  )

  const toggleLevelFilter = useLogExplorerStore((s) => s.toggleLevelFilter)
  const toggleServiceFilter = useLogExplorerStore((s) => s.toggleServiceFilter)
  const toggleNamespaceFilter = useLogExplorerStore((s) => s.toggleNamespaceFilter)
  const toggleNodeFilter = useLogExplorerStore((s) => s.toggleNodeFilter)
  const toggleWorkloadKindFilter = useLogExplorerStore((s) => s.toggleWorkloadKindFilter)

  function handleToggle(groupKey: string, value: string) {
    switch (groupKey) {
      case 'status':
        toggleLevelFilter(value as import('@/types/log').LogLevel)
        break
      case 'service':
        toggleServiceFilter(value)
        break
      case 'k8s.namespace.name':
        toggleNamespaceFilter(value)
        break
      case 'k8s.node.name':
        toggleNodeFilter(value)
        break
      case 'k8s.workload.kind':
        toggleWorkloadKindFilter(value)
        break
    }
  }

  const filteredFacets = facets.map((section) => ({
    ...section,
    groups: section.groups.map((group) => ({
      ...group,
      items: facetSearch
        ? group.items.filter((item) => item.value.toLowerCase().includes(facetSearch.toLowerCase()))
        : group.items,
    })).filter((group) => group.items.length > 0),
  })).filter((section) => section.groups.length > 0)

  return (
    <div className="flex h-full w-[220px] min-w-[220px] flex-col border-r bg-background">
      <div className="p-2">
        <div className="relative">
          <RiSearchLine className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search facets"
            value={facetSearch}
            onChange={(e) => setFacetSearch(e.target.value)}
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 overflow-auto">
        <div className="space-y-1 px-2 pb-4">
          {filteredFacets.map((section) => (
            <FacetSectionBlock key={section.key} section={section} onToggle={handleToggle} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
