export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'NONE'
export type TimeRange = '15m' | '1h' | '4h' | '12h' | '24h' | '7d'

export interface Log {
  id: string
  timestamp: Date
  level: LogLevel
  message: string
  service: string
  host: string
  env: string
  k8sClusterName: string
  k8sNodeName: string
  k8sNamespace: string
  k8sPodName: string
  k8sContainerName: string
  k8sWorkloadKind: string
  k8sWorkloadName: string
  logger: string
  thread: string
  traceId: string
  spanId: string
  duration?: number
  statusCode?: number
  fields: Record<string, string>
  mdc: Record<string, string>
  stackTrace?: string
}

export interface TimelineDataPoint {
  time: string
  timestamp: number
  ERROR: number
  WARN: number
  INFO: number
  DEBUG: number
  NONE: number
}

export interface FacetItem {
  value: string
  count: number
  selected: boolean
}

export interface FacetGroup {
  key: string
  label: string
  items: FacetItem[]
}

export interface FacetSection {
  key: string
  label: string
  groups: FacetGroup[]
}
