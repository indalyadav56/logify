import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Server,
  Network,
  Shield,
  Activity,
  Settings,
  Plus,
  BarChart,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Link,
  Globe,
  Database,
  Cpu,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'rest' | 'grpc' | 'graphql' | 'websocket';
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  endpoint: string;
  health: {
    uptime: number;
    lastCheck: string;
    responseTime: number;
  };
  metrics: {
    requests: number;
    errors: number;
    latency: number;
    availability: number;
  };
  dependencies: {
    id: string;
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    type: 'required' | 'optional';
  }[];
  security: {
    authentication: string[];
    encryption: boolean;
    rateLimit: number;
  };
  documentation: {
    swagger?: string;
    graphql?: string;
    readme?: string;
  };
}

interface ServiceInstance {
  id: string;
  serviceId: string;
  host: string;
  port: number;
  status: 'active' | 'draining' | 'inactive';
  health: {
    cpu: number;
    memory: number;
    disk: number;
  };
  metadata: {
    region: string;
    zone: string;
    environment: string;
  };
}

interface CircuitBreaker {
  serviceId: string;
  status: 'closed' | 'open' | 'half-open';
  failureRate: number;
  lastTripped: string;
  resetTimeout: number;
}

const ServiceRegistry = () => {
  const [timeRange, setTimeRange] = useState('24h');

  // Sample services
  const services: Service[] = [
    {
      id: '1',
      name: 'User Authentication API',
      description: 'Handles user authentication and authorization',
      version: '2.1.0',
      type: 'rest',
      status: 'healthy',
      endpoint: 'https://api.example.com/auth',
      health: {
        uptime: 99.99,
        lastCheck: '2025-01-31T06:15:00',
        responseTime: 45,
      },
      metrics: {
        requests: 15420,
        errors: 23,
        latency: 145,
        availability: 99.95,
      },
      dependencies: [
        {
          id: 'd1',
          name: 'User Database',
          status: 'healthy',
          type: 'required',
        },
        {
          id: 'd2',
          name: 'Cache Service',
          status: 'healthy',
          type: 'optional',
        },
      ],
      security: {
        authentication: ['JWT', 'OAuth2'],
        encryption: true,
        rateLimit: 1000,
      },
      documentation: {
        swagger: '/api/auth/swagger',
        readme: '/docs/auth/readme.md',
      },
    },
    {
      id: '2',
      name: 'Payment Processing Service',
      description: 'Handles payment processing and transactions',
      version: '1.5.2',
      type: 'grpc',
      status: 'degraded',
      endpoint: 'grpc://payments.example.com:50051',
      health: {
        uptime: 99.85,
        lastCheck: '2025-01-31T06:14:00',
        responseTime: 89,
      },
      metrics: {
        requests: 8750,
        errors: 45,
        latency: 232,
        availability: 99.82,
      },
      dependencies: [
        {
          id: 'd3',
          name: 'Payment Gateway',
          status: 'degraded',
          type: 'required',
        },
        {
          id: 'd4',
          name: 'Fraud Detection',
          status: 'healthy',
          type: 'required',
        },
      ],
      security: {
        authentication: ['mTLS', 'API Key'],
        encryption: true,
        rateLimit: 500,
      },
      documentation: {
        readme: '/docs/payments/readme.md',
      },
    },
  ];

  // Sample service instances
  const instances: ServiceInstance[] = [
    {
      id: 'i1',
      serviceId: '1',
      host: '10.0.1.100',
      port: 8080,
      status: 'active',
      health: {
        cpu: 45,
        memory: 62,
        disk: 35,
      },
      metadata: {
        region: 'us-west',
        zone: 'us-west-1a',
        environment: 'production',
      },
    },
    {
      id: 'i2',
      serviceId: '1',
      host: '10.0.1.101',
      port: 8080,
      status: 'active',
      health: {
        cpu: 52,
        memory: 58,
        disk: 40,
      },
      metadata: {
        region: 'us-west',
        zone: 'us-west-1b',
        environment: 'production',
      },
    },
  ];

  // Sample circuit breakers
  const circuitBreakers: CircuitBreaker[] = [
    {
      serviceId: '1',
      status: 'closed',
      failureRate: 0.02,
      lastTripped: '2025-01-30T15:30:00',
      resetTimeout: 30000,
    },
    {
      serviceId: '2',
      status: 'half-open',
      failureRate: 0.15,
      lastTripped: '2025-01-31T05:45:00',
      resetTimeout: 60000,
    },
  ];

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-700';
      case 'degraded':
        return 'bg-yellow-50 text-yellow-700';
      case 'down':
        return 'bg-red-50 text-red-700';
      case 'maintenance':
        return 'bg-blue-50 text-blue-700';
      default:
        return '';
    }
  };

  const getInstanceStatusColor = (status: ServiceInstance['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700';
      case 'draining':
        return 'bg-yellow-50 text-yellow-700';
      case 'inactive':
        return 'bg-red-50 text-red-700';
      default:
        return '';
    }
  };

  const getCircuitBreakerStatusColor = (status: CircuitBreaker['status']) => {
    switch (status) {
      case 'closed':
        return 'bg-green-50 text-green-700';
      case 'half-open':
        return 'bg-yellow-50 text-yellow-700';
      case 'open':
        return 'bg-red-50 text-red-700';
      default:
        return '';
    }
  };

  const getServiceTypeIcon = (type: Service['type']) => {
    switch (type) {
      case 'rest':
        return <Globe className="h-4 w-4" />;
      case 'grpc':
        return <Network className="h-4 w-4" />;
      case 'graphql':
        return <Database className="h-4 w-4" />;
      case 'websocket':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Service Registry</h1>
          <p className="text-muted-foreground">
            Monitor and manage microservices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Services */}
        <div className="col-span-12 space-y-4">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{service.name}</h3>
                      <Badge variant="outline" className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                      <Badge variant="secondary">v{service.version}</Badge>
                      <div className="flex items-center gap-1">
                        {getServiceTypeIcon(service.type)}
                        <span className="text-sm">{service.type}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{service.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Link className="h-4 w-4" />
                      <span>{service.endpoint}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Shield className="mr-2 h-4 w-4" />
                      Security
                    </Button>
                    <Button size="sm">
                      <Activity className="mr-2 h-4 w-4" />
                      Monitor
                    </Button>
                  </div>
                </div>

                {/* Service Health */}
                <div className="mt-6 grid grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Uptime</p>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="text-xl font-bold">
                        {service.health.uptime}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Response Time</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-xl font-bold">
                        {service.health.responseTime}ms
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Error Rate</p>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-xl font-bold">
                        {((service.metrics.errors / service.metrics.requests) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Availability</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      <span className="text-xl font-bold">
                        {service.metrics.availability}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Dependencies */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Dependencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.dependencies.map((dep) => (
                      <div
                        key={dep.id}
                        className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                      >
                        <span className="text-sm">{dep.name}</span>
                        <Badge
                          variant="outline"
                          className={getStatusColor(dep.status)}
                        >
                          {dep.status}
                        </Badge>
                        <Badge variant="secondary">{dep.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Instances */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Instances</h4>
                  <div className="space-y-2">
                    {instances
                      .filter((instance) => instance.serviceId === service.id)
                      .map((instance) => (
                        <div
                          key={instance.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Server className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {instance.host}:{instance.port}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={getInstanceStatusColor(instance.status)}
                            >
                              {instance.status}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span>{instance.metadata.region}</span>
                              <span>•</span>
                              <span>{instance.metadata.zone}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Cpu className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{instance.health.cpu}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {instance.health.memory}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Circuit Breaker */}
                {circuitBreakers
                  .filter((cb) => cb.serviceId === service.id)
                  .map((cb) => (
                    <div key={cb.serviceId} className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">Circuit Breaker</p>
                            <p className="text-sm text-muted-foreground">
                              Failure Rate: {(cb.failureRate * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getCircuitBreakerStatusColor(cb.status)}
                          >
                            {cb.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Reset: {cb.resetTimeout}ms
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Metrics */}
        <div className="col-span-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Service Metrics</h2>
                <Select defaultValue="requests">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requests">Request Volume</SelectItem>
                    <SelectItem value="latency">Latency</SelectItem>
                    <SelectItem value="errors">Error Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="aspect-[2/1] bg-muted rounded-lg flex items-center justify-center">
                <BarChart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Health */}
        <div className="col-span-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Service Health</h2>
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 bg-muted rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {service.status === 'healthy' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : service.status === 'degraded' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(service.status)}
                      >
                        {service.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Response Time</span>
                        <span>{service.health.responseTime}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Error Rate</span>
                        <span>
                          {((service.metrics.errors / service.metrics.requests) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceRegistry;
