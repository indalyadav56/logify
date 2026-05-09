import type { Log, LogLevel } from '@/types/log'

const SERVICES = [
  'api-gateway',
  'auth-service',
  'payment-service',
  'user-service',
  'notification-service',
  'order-service',
]

const HOSTS = [
  'aks-userpool-6-vmss000003',
  'aks-userpool-6-vmss000004',
  'ip-10-178-54-ec2.internal',
  'ip-10-178-50-44.ec2.internal',
]

const NAMESPACES = ['kube-system', 'unguard', 'dynatrace', 'operator', 'provisioner']

const POD_TEMPLATES: Record<string, string[]> = {
  'kube-system': ['envoy-proxy', 'webhook', 'status-service'],
  unguard: ['unguard-frontend', 'unguard-api', 'unguard-db'],
  dynatrace: ['dynatrace-agent', 'dt-operator'],
  operator: ['operator'],
  provisioner: ['provisioner'],
}

const WORKLOAD_KINDS = ['Deployment', 'StatefulSet', 'DaemonSet']

const ERROR_MESSAGES = [
  'Transport error: 503 Error: Service Unavailable',
  'Cannot invoke WebService for plugin get all names while connecting to https://easytravel-websrv.lab.dynatrace.org/services/ConfigurationService/: org.apache.axis2.AxisFault: Transport error: 503 Error: Service Unavailable: AxisFault: Transport error: 503 Error: Service Unavailable',
  'Cannot invoke WebService for plugin register while connecting to https://easytravel-websrv.lab.dynatrace.org/services/ConfigurationService/: org.apache.axis2.AxisFault: Transport error: 503 Error: Service Unavailable',
  'NullPointerException at com.example.service.UserService.findById(UserService.java:123)',
  'Connection refused: localhost:5432 - database unavailable after 3 retries',
  'Failed to process payment: gateway timeout after 30000ms',
  'Database connection pool exhausted: max 100 connections active',
  'OutOfMemoryError: Java heap space — current usage 98.7%',
  'Failed to deserialize response: unexpected end of JSON input at position 1432',
  'Circuit breaker OPEN for target: payment-service after 5 consecutive failures',
  'SSL handshake failed: certificate expired 2 days ago for host auth.internal',
  'Kafka consumer group lag exceeded threshold: 12400 messages behind',
]

const WARN_MESSAGES = [
  'RemoteException while loading journey: Transport error: 503 Error: Service Unavailable',
  'High memory usage detected: 85% of heap used',
  'Slow query detected: 2350ms > 1000ms threshold — SELECT * FROM orders WHERE user_id = ? AND status IN (?,?,?)',
  'Circuit breaker half-open for service: auth-service, allowing test request',
  'Rate limit approaching: 950/1000 requests per minute for client ip=10.0.0.42',
  'Connection pool at 80% capacity: 80/100 connections active',
  'Failed to send notification: retrying (attempt 2/3) — SMTP timeout',
  'Cache miss rate elevated: 43% over last 5 minutes, expected < 15%',
  'Deprecated API endpoint called: /api/v1/users/legacy — client=mobile-ios-3.2.1',
  'JWT token expiring soon for user: user@example.com (expires in 300s)',
  'Some plugins are not registered any more, trying to register [ThirdPartyWebAnalyticsTool, JavascriptIncreasedErrorCount, JavascriptErrorOnLabelClick, MagentoShop]',
  'Disk usage at 78% on /data volume — consider cleanup',
  'GC pause duration exceeded threshold: 840ms > 500ms',
]

const INFO_MESSAGES = [
  'Request completed: POST /api/v1/users 201 45ms',
  'Request completed: GET /api/v1/orders 200 12ms',
  'Request completed: PUT /api/v1/orders/ORD-001234/status 200 33ms',
  'User authenticated successfully: user@example.com session=sess_a8f3c912',
  'Cache hit ratio: 87.3% over last 1 hour',
  'Health check passed: all 12 dependencies healthy',
  'Started application context in 3.842 seconds (JVM running for 4.121s)',
  'Order processed successfully: order_id=ORD-2026-001234 total=99.99 USD',
  'User session created: session_id=sess_abc123 ttl=3600s',
  'Database migration completed: 24 migrations applied in 1.2s',
  'Message published to queue: payment.events partition=3 offset=482991',
  'Scheduled job completed: cleanup-expired-sessions duration=1.2s records_deleted=1423',
  'New user registered: user_id=usr_abc123 email=newuser@example.com referral=google',
  'Payment gateway response received: status=approved amount=99.99 currency=USD txn_id=TXN-839201',
  'Feature flag rollout progressed: enable_new_checkout 45% → 50%',
  'CDN cache purged for path: /assets/v2/* — 2341 objects invalidated',
]

const DEBUG_MESSAGES = [
  'Processing event: UserCreated{id=usr_123, email=user@example.com, timestamp=2026-01-08T11:09:36.222Z}',
  'Cache key generated: user:profile:usr_123:v2',
  'SQL: SELECT u.*, p.* FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = ?; params=[usr_123] duration=4ms',
  'Dispatching Redux action: FETCH_USER_DATA payload={userId: "usr_123"}',
  'HTTP upstream request: GET https://api.internal/users/usr_123 duration=8ms status=200',
  'Feature flag evaluated: enable_new_checkout=true for user=usr_123 cohort=beta',
  'Redis HSET user:session:sess_abc123 {userId: usr_123, createdAt: 2026-01-08T11:09:36Z} OK',
  'Queue consumer received message: id=msg_abc123 queue=payment.events offset=482991',
  'Span started: checkout.process traceId=a8f3c912b4d2 parentSpanId=7e2a1b3c',
]

const NONE_MESSAGES = [
  'Starting graceful shutdown, waiting for in-flight requests...',
  'Applying configuration: max-connections=100 timeout=30000 keep-alive=true',
  'Loaded 423 routes from configuration file /etc/app/routes.yaml',
  'Registered health check endpoint: /health /ready /live',
  'Worker process started: pid=14823 thread-pool=32',
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateStackTrace(): string {
  return `com.example.service.PaymentService.processPayment(PaymentService.java:142)
\tat com.example.controller.PaymentController.charge(PaymentController.java:78)
\tat sun.reflect.GeneratedMethodAccessor42.invoke(Unknown Source)
\tat sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
\tat java.lang.reflect.Method.invoke(Method.java:498)
\tat org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:895)
\tat org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:800)
Caused by: java.net.ConnectException: Connection refused (Connection refused)
\tat java.net.PlainSocketImpl.socketConnect(Native Method)
\tat java.net.AbstractPlainSocketImpl.doConnect(AbstractPlainSocketImpl.java:350)`
}

function generateLog(id: number, baseTime: Date, spanMs: number): Log {
  const rand = Math.random()
  let level: LogLevel
  if (rand < 0.13) level = 'ERROR'
  else if (rand < 0.38) level = 'WARN'
  else if (rand < 0.86) level = 'INFO'
  else if (rand < 0.95) level = 'DEBUG'
  else level = 'NONE'

  const messageMap: Record<LogLevel, string[]> = {
    ERROR: ERROR_MESSAGES,
    WARN: WARN_MESSAGES,
    INFO: INFO_MESSAGES,
    DEBUG: DEBUG_MESSAGES,
    NONE: NONE_MESSAGES,
  }

  const service = randomFrom(SERVICES)
  const host = randomFrom(HOSTS)
  const namespace = randomFrom(NAMESPACES)
  const pods = POD_TEMPLATES[namespace] || ['unknown-pod']
  const podBase = randomFrom(pods)
  const podSuffix = Math.random().toString(36).slice(2, 7)
  const workloadKind = randomFrom(WORKLOAD_KINDS)

  const timestampOffset = Math.floor(Math.random() * spanMs)
  const timestamp = new Date(baseTime.getTime() - timestampOffset)
  const ms = randomInt(0, 999).toString().padStart(3, '0')
  const timestampWithMs = new Date(timestamp.getTime())
  ;(timestampWithMs as Date & { ms?: string }).ms = ms

  const traceId = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  const spanId = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  const thread = `http-bio-8080-exec-${randomInt(1, 20)}`
  const logger = `com.logify.${service.replace(/-/g, '.')}.MainService`
  const message = randomFrom(messageMap[level])

  return {
    id: `log-${id}-${Date.now()}`,
    timestamp,
    level,
    message,
    service,
    host,
    env: randomFrom(['prod', 'prod', 'staging', 'dev']),
    k8sClusterName: 'production-cluster',
    k8sNodeName: host,
    k8sNamespace: namespace,
    k8sPodName: `${podBase}-${podSuffix}`,
    k8sContainerName: service,
    k8sWorkloadKind: workloadKind,
    k8sWorkloadName: service,
    logger,
    thread,
    traceId,
    spanId,
    duration: level === 'INFO' || level === 'DEBUG' ? randomInt(1, 1200) : undefined,
    statusCode:
      level === 'ERROR'
        ? randomFrom([500, 502, 503, 504])
        : level === 'INFO'
          ? randomFrom([200, 201, 204, 200, 200])
          : undefined,
    fields: {
      timestamp: timestamp.toISOString(),
      level,
      thread,
      logger,
      message,
      context: 'default',
    },
    mdc: {
      requestId: `req-${Math.random().toString(36).slice(2, 10)}`,
      userId: `usr-${randomInt(1000, 99999)}`,
      sessionId: `sess-${Math.random().toString(36).slice(2, 10)}`,
      correlationId: traceId,
    },
    stackTrace: level === 'ERROR' && Math.random() > 0.4 ? generateStackTrace() : undefined,
  }
}

export function generateMockLogs(count = 600, spanMinutes = 65): Log[] {
  const baseTime = new Date()
  const spanMs = spanMinutes * 60 * 1000
  const logs: Log[] = []
  for (let i = 0; i < count; i++) {
    logs.push(generateLog(i, baseTime, spanMs))
  }
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export const MOCK_LOGS = generateMockLogs(600)
