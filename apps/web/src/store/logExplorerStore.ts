import { create } from 'zustand'
import type { Log, LogLevel, TimeRange, TimelineDataPoint, FacetSection } from '@/types/log'
import { searchLogs } from '@/api/logsApi'
import { format, subMinutes, subHours, subDays } from 'date-fns'

export interface LogFilters {
  levels: Set<LogLevel>
  services: Set<string>
  k8sNamespaces: Set<string>
  k8sNodes: Set<string>
  k8sWorkloadKinds: Set<string>
}

interface LogExplorerStore {
  allLogs: Log[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  filters: LogFilters
  timeRange: TimeRange
  selectedLog: Log | null
  currentPage: number
  readonly pageSize: number
  showTimeline: boolean
  facetSearch: string

  fetchLogs: () => Promise<void>
  setSearchQuery: (query: string) => void
  setTimeRange: (range: TimeRange) => void
  setSelectedLog: (log: Log | null) => void
  setCurrentPage: (page: number) => void
  toggleLevelFilter: (level: LogLevel) => void
  toggleServiceFilter: (service: string) => void
  toggleNamespaceFilter: (namespace: string) => void
  toggleNodeFilter: (node: string) => void
  toggleWorkloadKindFilter: (kind: string) => void
  clearFilters: () => void
  toggleTimeline: () => void
  setFacetSearch: (search: string) => void
}

function getTimeRangeStart(range: TimeRange): Date {
  const now = new Date()
  switch (range) {
    case '15m':
      return subMinutes(now, 15)
    case '1h':
      return subHours(now, 1)
    case '4h':
      return subHours(now, 4)
    case '12h':
      return subHours(now, 12)
    case '24h':
      return subHours(now, 24)
    case '7d':
      return subDays(now, 7)
  }
}

export function getFilteredLogs(
  allLogs: Log[],
  searchQuery: string,
  filters: LogFilters,
  timeRange: TimeRange,
): Log[] {
  const rangeStart = getTimeRangeStart(timeRange)

  return allLogs.filter((log) => {
    if (log.timestamp < rangeStart) return false
    if (filters.levels.size > 0 && !filters.levels.has(log.level)) return false
    if (filters.services.size > 0 && !filters.services.has(log.service)) return false
    if (filters.k8sNamespaces.size > 0 && !filters.k8sNamespaces.has(log.k8sNamespace)) return false
    if (filters.k8sNodes.size > 0 && !filters.k8sNodes.has(log.k8sNodeName)) return false
    if (filters.k8sWorkloadKinds.size > 0 && !filters.k8sWorkloadKinds.has(log.k8sWorkloadKind))
      return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        log.message.toLowerCase().includes(q) ||
        log.service.toLowerCase().includes(q) ||
        log.k8sNamespace.toLowerCase().includes(q) ||
        log.host.toLowerCase().includes(q) ||
        log.level.toLowerCase().includes(q) ||
        log.traceId.toLowerCase().includes(q)
      )
    }

    return true
  })
}

const emptyFilters: LogFilters = {
  levels: new Set(),
  services: new Set(),
  k8sNamespaces: new Set(),
  k8sNodes: new Set(),
  k8sWorkloadKinds: new Set(),
}

// ─── Selectors ───────────────────────────────────────────────────────────────

export function selectFilteredLogs(state: LogExplorerStore): Log[] {
  return getFilteredLogs(state.allLogs, state.searchQuery, state.filters, state.timeRange)
}

export function selectPagedLogs(state: LogExplorerStore): Log[] {
  const filtered = selectFilteredLogs(state)
  const start = (state.currentPage - 1) * state.pageSize
  return filtered.slice(start, start + state.pageSize)
}

export function selectTotalPages(state: LogExplorerStore): number {
  return Math.max(1, Math.ceil(selectFilteredLogs(state).length / state.pageSize))
}

export function selectFilteredCount(state: LogExplorerStore): number {
  return selectFilteredLogs(state).length
}

export function selectFacets(state: LogExplorerStore): FacetSection[] {
  // Facet counts ignore facet filters (show global counts in time range)
  const baseLogs = getFilteredLogs(
    state.allLogs,
    state.searchQuery,
    { ...emptyFilters },
    state.timeRange,
  )

  const levelCounts = new Map<string, number>()
  const serviceCounts = new Map<string, number>()
  const namespaceCounts = new Map<string, number>()
  const nodeCounts = new Map<string, number>()
  const workloadKindCounts = new Map<string, number>()
  const workloadNameCounts = new Map<string, number>()
  const podCounts = new Map<string, number>()
  const containerCounts = new Map<string, number>()

  for (const log of baseLogs) {
    levelCounts.set(log.level, (levelCounts.get(log.level) || 0) + 1)
    serviceCounts.set(log.service, (serviceCounts.get(log.service) || 0) + 1)
    namespaceCounts.set(log.k8sNamespace, (namespaceCounts.get(log.k8sNamespace) || 0) + 1)
    nodeCounts.set(log.k8sNodeName, (nodeCounts.get(log.k8sNodeName) || 0) + 1)
    workloadKindCounts.set(log.k8sWorkloadKind, (workloadKindCounts.get(log.k8sWorkloadKind) || 0) + 1)
    workloadNameCounts.set(log.k8sWorkloadName, (workloadNameCounts.get(log.k8sWorkloadName) || 0) + 1)
    podCounts.set(log.k8sPodName, (podCounts.get(log.k8sPodName) || 0) + 1)
    containerCounts.set(log.k8sContainerName, (containerCounts.get(log.k8sContainerName) || 0) + 1)
  }

  const toItems = (map: Map<string, number>, selectedSet: Set<string>, limit = 8) =>
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([value, count]) => ({ value, count, selected: selectedSet.has(value) }))

  const LEVEL_ORDER: LogLevel[] = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'NONE']
  const levelItems = LEVEL_ORDER.filter((l) => levelCounts.has(l)).map((l) => ({
    value: l,
    count: levelCounts.get(l)!,
    selected: state.filters.levels.has(l),
  }))

  return [
    {
      key: 'core',
      label: 'Core',
      groups: [
        { key: 'status', label: 'Status', items: levelItems },
        { key: 'service', label: 'Log source', items: toItems(serviceCounts, state.filters.services) },
      ],
    },
    {
      key: 'k8s',
      label: 'K8s',
      groups: [
        {
          key: 'k8s.cluster.name',
          label: 'k8s.cluster.name',
          items: [{ value: 'production-cluster', count: baseLogs.length, selected: false }],
        },
        {
          key: 'k8s.node.name',
          label: 'k8s.node.name',
          items: toItems(nodeCounts, state.filters.k8sNodes),
        },
        {
          key: 'k8s.namespace.name',
          label: 'k8s.namespace.name',
          items: toItems(namespaceCounts, state.filters.k8sNamespaces),
        },
        {
          key: 'k8s.pod.name',
          label: 'k8s.pod.name',
          items: toItems(podCounts, new Set(), 6),
        },
        {
          key: 'k8s.container.name',
          label: 'k8s.container.name',
          items: toItems(containerCounts, new Set()),
        },
        {
          key: 'k8s.workload.kind',
          label: 'k8s.workload.kind',
          items: toItems(workloadKindCounts, state.filters.k8sWorkloadKinds),
        },
        {
          key: 'k8s.workload.name',
          label: 'k8s.workload.name',
          items: toItems(workloadNameCounts, new Set()),
        },
      ],
    },
  ]
}

export function selectTimeline(state: LogExplorerStore): TimelineDataPoint[] {
  const filtered = selectFilteredLogs(state)
  const now = new Date()
  const rangeStart = getTimeRangeStart(state.timeRange)

  let bucketCount: number
  let labelFormat: string

  switch (state.timeRange) {
    case '15m':
      bucketCount = 15
      labelFormat = 'HH:mm'
      break
    case '1h':
      bucketCount = 30
      labelFormat = 'HH:mm'
      break
    case '4h':
      bucketCount = 48
      labelFormat = 'HH:mm'
      break
    case '12h':
      bucketCount = 48
      labelFormat = 'HH:mm'
      break
    case '24h':
      bucketCount = 48
      labelFormat = 'HH:mm'
      break
    case '7d':
      bucketCount = 28
      labelFormat = 'MMM d'
      break
    default:
      bucketCount = 30
      labelFormat = 'HH:mm'
  }

  const totalMs = now.getTime() - rangeStart.getTime()
  const bucketSizeMs = totalMs / bucketCount

  const buckets: TimelineDataPoint[] = Array.from({ length: bucketCount }, (_, i) => {
    const bucketTime = new Date(rangeStart.getTime() + (i + 0.5) * bucketSizeMs)
    return {
      time: format(bucketTime, labelFormat),
      timestamp: bucketTime.getTime(),
      ERROR: 0,
      WARN: 0,
      INFO: 0,
      DEBUG: 0,
      NONE: 0,
    }
  })

  for (const log of filtered) {
    const bucketIndex = Math.floor((log.timestamp.getTime() - rangeStart.getTime()) / bucketSizeMs)
    if (bucketIndex >= 0 && bucketIndex < bucketCount) {
      buckets[bucketIndex][log.level]++
    }
  }

  return buckets
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLogExplorerStore = create<LogExplorerStore>()((set, get) => ({
  allLogs: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: { ...emptyFilters },
  timeRange: '7d',
  selectedLog: null,
  currentPage: 1,
  pageSize: 50,
  showTimeline: true,
  facetSearch: '',

  fetchLogs: async () => {
    const state = get()
    set({ isLoading: true, error: null })
    try {
      const attributes: Record<string, string> = {}
      if (state.filters.k8sNamespaces.size > 0) attributes['k8s.namespace.name'] = Array.from(state.filters.k8sNamespaces).join(',')
      if (state.filters.k8sNodes.size > 0) attributes['k8s.node.name'] = Array.from(state.filters.k8sNodes).join(',')
      if (state.filters.k8sWorkloadKinds.size > 0) attributes['k8s.workload.kind'] = Array.from(state.filters.k8sWorkloadKinds).join(',')

      const { mappedLogs } = await searchLogs({
        tenant_id: 'acme-corp',
        from: getTimeRangeStart(state.timeRange).toISOString(),
        to: new Date().toISOString(),
        body_contains: state.searchQuery || undefined,
        severities: state.filters.levels.size > 0 ? Array.from(state.filters.levels) : undefined,
        services: state.filters.services.size > 0 ? Array.from(state.filters.services) : undefined,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        limit: 1000,
      })
      set({ allLogs: mappedLogs, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 })
    get().fetchLogs()
  },
  setTimeRange: (range) => {
    set({ timeRange: range, currentPage: 1 })
    get().fetchLogs()
  },
  setSelectedLog: (log) => set({ selectedLog: log }),
  setCurrentPage: (page) => set({ currentPage: page }),

  toggleLevelFilter: (level) => {
    const state = get()
    const levels = new Set(state.filters.levels)
    if (levels.has(level)) levels.delete(level)
    else levels.add(level)
    set({ filters: { ...state.filters, levels }, currentPage: 1 })
    get().fetchLogs()
  },

  toggleServiceFilter: (service) => {
    const state = get()
    const services = new Set(state.filters.services)
    if (services.has(service)) services.delete(service)
    else services.add(service)
    set({ filters: { ...state.filters, services }, currentPage: 1 })
    get().fetchLogs()
  },

  toggleNamespaceFilter: (namespace) => {
    const state = get()
    const k8sNamespaces = new Set(state.filters.k8sNamespaces)
    if (k8sNamespaces.has(namespace)) k8sNamespaces.delete(namespace)
    else k8sNamespaces.add(namespace)
    set({ filters: { ...state.filters, k8sNamespaces }, currentPage: 1 })
    get().fetchLogs()
  },

  toggleNodeFilter: (node) => {
    const state = get()
    const k8sNodes = new Set(state.filters.k8sNodes)
    if (k8sNodes.has(node)) k8sNodes.delete(node)
    else k8sNodes.add(node)
    set({ filters: { ...state.filters, k8sNodes }, currentPage: 1 })
    get().fetchLogs()
  },

  toggleWorkloadKindFilter: (kind) => {
    const state = get()
    const k8sWorkloadKinds = new Set(state.filters.k8sWorkloadKinds)
    if (k8sWorkloadKinds.has(kind)) k8sWorkloadKinds.delete(kind)
    else k8sWorkloadKinds.add(kind)
    set({ filters: { ...state.filters, k8sWorkloadKinds }, currentPage: 1 })
    get().fetchLogs()
  },

  clearFilters: () => {
    set({
      filters: {
        levels: new Set(),
        services: new Set(),
        k8sNamespaces: new Set(),
        k8sNodes: new Set(),
        k8sWorkloadKinds: new Set(),
      },
      searchQuery: '',
      currentPage: 1,
    })
    get().fetchLogs()
  },

  toggleTimeline: () => set((state) => ({ showTimeline: !state.showTimeline })),
  setFacetSearch: (search) => set({ facetSearch: search }),
}))
