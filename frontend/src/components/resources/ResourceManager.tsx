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
  Database,
  HardDrive,
  Cpu,
  Network,
  Plus,
  Settings,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart,
  Activity,
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface Resource {
  id: string;
  name: string;
  type: 'server' | 'database' | 'storage' | 'compute';
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  utilization: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  cost: {
    hourly: number;
    monthly: number;
    projected: number;
  };
  metrics: {
    uptime: number;
    requests: number;
    errors: number;
    latency: number;
  };
  allocation: {
    team: string;
    project: string;
    environment: string;
  };
  maintenance?: {
    scheduled: string;
    duration: number;
    type: 'upgrade' | 'backup' | 'patch';
  };
}

interface ResourceMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  cost: number;
}

interface Forecast {
  period: string;
  utilization: number;
  cost: number;
  trend: 'up' | 'down' | 'stable';
}

const ResourceManager = () => {
  const [timeRange, setTimeRange] = useState('24h');


  // Sample resources
  const resources: Resource[] = [
    {
      id: '1',
      name: 'Production API Server',
      type: 'server',
      status: 'healthy',
      utilization: {
        cpu: 65,
        memory: 72,
        storage: 45,
        network: 58,
      },
      cost: {
        hourly: 1.25,
        monthly: 900,
        projected: 950,
      },
      metrics: {
        uptime: 99.99,
        requests: 15420,
        errors: 23,
        latency: 145,
      },
      allocation: {
        team: 'Platform',
        project: 'API Gateway',
        environment: 'production',
      },
    },
    {
      id: '2',
      name: 'Analytics Database',
      type: 'database',
      status: 'warning',
      utilization: {
        cpu: 85,
        memory: 78,
        storage: 82,
        network: 45,
      },
      cost: {
        hourly: 2.50,
        monthly: 1800,
        projected: 2000,
      },
      metrics: {
        uptime: 99.95,
        requests: 8750,
        errors: 45,
        latency: 232,
      },
      allocation: {
        team: 'Analytics',
        project: 'Data Pipeline',
        environment: 'production',
      },
      maintenance: {
        scheduled: '2025-02-01T02:00:00',
        duration: 120,
        type: 'backup',
      },
    },
  ];

  // Sample metrics history
  const metrics: ResourceMetric[] = [
    {
      timestamp: '2025-01-31T05:45:00',
      cpu: 65,
      memory: 72,
      storage: 45,
      network: 58,
      cost: 1.25,
    },
    {
      timestamp: '2025-01-31T05:30:00',
      cpu: 62,
      memory: 70,
      storage: 45,
      network: 55,
      cost: 1.25,
    },
  ];

  // Sample forecasts
  const forecasts: Forecast[] = [
    {
      period: 'Next Week',
      utilization: 75,
      cost: 980,
      trend: 'up',
    },
    {
      period: 'Next Month',
      utilization: 82,
      cost: 1050,
      trend: 'up',
    },
  ];

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-700';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700';
      case 'critical':
        return 'bg-red-50 text-red-700';
      case 'maintenance':
        return 'bg-blue-50 text-blue-700';
      default:
        return '';
    }
  };

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'server':
        return <Server className="h-5 w-5" />;
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'storage':
        return <HardDrive className="h-5 w-5" />;
      case 'compute':
        return <Cpu className="h-5 w-5" />;
      default:
        return <Server className="h-5 w-5" />;
    }
  };

  const getUtilizationColor = (value: number) => {
    if (value >= 90) return 'text-red-500';
    if (value >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Resource Management</h1>
          <p className="text-muted-foreground">
            Monitor and optimize resource allocation and costs
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
            Add Resource
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Resource Overview */}
        <div className="col-span-12 space-y-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-primary/10`}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{resource.name}</h3>
                        <Badge
                          variant="outline"
                          className={getStatusColor(resource.status)}
                        >
                          {resource.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{resource.type}</span>
                        <span>•</span>
                        <span>{resource.allocation.environment}</span>
                        <span>•</span>
                        <span>{resource.allocation.team}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    {resource.maintenance && (
                      <Button variant="outline" size="sm">
                        <Clock className="mr-2 h-4 w-4" />
                        View Maintenance
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">CPU Usage</p>
                      <span
                        className={`text-sm font-medium ${getUtilizationColor(
                          resource.utilization.cpu
                        )}`}
                      >
                        {resource.utilization.cpu}%
                      </span>
                    </div>
                    <Progress value={resource.utilization.cpu} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Memory</p>
                      <span
                        className={`text-sm font-medium ${getUtilizationColor(
                          resource.utilization.memory
                        )}`}
                      >
                        {resource.utilization.memory}%
                      </span>
                    </div>
                    <Progress value={resource.utilization.memory} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Storage</p>
                      <span
                        className={`text-sm font-medium ${getUtilizationColor(
                          resource.utilization.storage
                        )}`}
                      >
                        {resource.utilization.storage}%
                      </span>
                    </div>
                    <Progress value={resource.utilization.storage} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Network</p>
                      <span
                        className={`text-sm font-medium ${getUtilizationColor(
                          resource.utilization.network
                        )}`}
                      >
                        {resource.utilization.network}%
                      </span>
                    </div>
                    <Progress value={resource.utilization.network} />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Cost/Hour</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-xl font-bold">
                        ${resource.cost.hourly}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Cost</p>
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-blue-500" />
                      <span className="text-xl font-bold">
                        ${resource.cost.monthly}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Uptime</p>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <span className="text-xl font-bold">
                        {resource.metrics.uptime}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Latency</p>
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-orange-500" />
                      <span className="text-xl font-bold">
                        {resource.metrics.latency}ms
                      </span>
                    </div>
                  </div>
                </div>

                {resource.maintenance && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-blue-700">
                            Scheduled Maintenance
                          </p>
                          <p className="text-sm text-blue-600">
                            {new Date(
                              resource.maintenance.scheduled
                            ).toLocaleString()}{' '}
                            ({resource.maintenance.duration} minutes)
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-blue-700">
                        {resource.maintenance.type}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resource Metrics */}
        <div className="col-span-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Resource Metrics</h2>
                <Select defaultValue="utilization">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utilization">Utilization</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="aspect-[2/1] bg-muted rounded-lg flex items-center justify-center">
                <BarChart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resource Forecasts */}
        <div className="col-span-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Forecasts</h2>
              <div className="space-y-4">
                {forecasts.map((forecast, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{forecast.period}</p>
                      <TrendingUp
                        className={`h-4 w-4 ${
                          forecast.trend === 'up'
                            ? 'text-red-500'
                            : forecast.trend === 'down'
                            ? 'text-green-500'
                            : 'text-blue-500'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Utilization
                        </p>
                        <p className="text-lg font-bold">{forecast.utilization}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="text-lg font-bold">${forecast.cost}</p>
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

export default ResourceManager;
