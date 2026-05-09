import type { Log, LogLevel } from '@/types/log'

export interface SearchLogsRequest {
  tenant_id: string
  services?: string[]
  severities?: string[]
  hosts?: string[]
  trace_id?: string
  request_id?: string
  body_contains?: string
  attributes?: Record<string, string>
  from: string
  to: string
  limit?: number
  cursor?: string
  sort_desc?: boolean
}

export interface SearchLogsResponse {
  logs: any[]
  total: number
  next_cursor?: string
  took_ms: number
}

export async function searchLogs(request: SearchLogsRequest): Promise<{ data: SearchLogsResponse; mappedLogs: Log[] }> {
  
  const response = await fetch('http://localhost:8080/v1/logs/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Failed to search logs: ${response.status} ${errText}`)
  }

  const data = (await response.json()) as SearchLogsResponse

  // Map backend LogResponse to frontend Log
  const mappedLogs: Log[] = (data.logs || []).map((log: any) => ({
    id: log.log_id,
    timestamp: new Date(log.timestamp),
    level: log.severity as LogLevel,
    message: log.body,
    service: log.service || '',
    host: log.host || '',
    env: log.environment || '',
    k8sClusterName: log.attributes?.['k8s.cluster.name'] || log.tags?.['cluster'] || '',
    k8sNodeName: log.attributes?.['k8s.node.name'] || log.tags?.['node'] || '',
    k8sNamespace: log.namespace || log.attributes?.['k8s.namespace.name'] || '',
    k8sPodName: log.attributes?.['k8s.pod.name'] || log.tags?.['pod'] || '',
    k8sContainerName: log.attributes?.['k8s.container.name'] || log.tags?.['container'] || '',
    k8sWorkloadKind: log.attributes?.['k8s.workload.kind'] || '',
    k8sWorkloadName: log.attributes?.['k8s.workload.name'] || '',
    logger: log.attributes?.['logger'] || log.source || '',
    thread: log.attributes?.['thread'] || '',
    traceId: log.trace_id || '',
    spanId: log.span_id || '',
    duration: log.attributes?.['duration'] ? Number.parseInt(log.attributes['duration'], 10) : undefined,
    statusCode: log.attributes?.['http.status_code'] ? Number.parseInt(log.attributes['http.status_code'], 10) : undefined,
    fields: log.attributes || {},
    mdc: log.tags || {},
    stackTrace: log.attributes?.['exception.stacktrace'] || undefined,
  }))

  return { data, mappedLogs }
}
