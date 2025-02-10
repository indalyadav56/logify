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
  Activity,
  Cpu,
  HardDrive,
  Network,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Download,
  Settings,
  RefreshCw,
  LucideMemoryStick,
} from 'lucide-react';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  threshold: {
    warning: number;
    critical: number;
  };
  history: {
    timestamp: string;
    value: number;
  }[];
}

interface ResourceUsage {
  id: string;
  name: string;
  type: 'compute' | 'memory' | 'storage' | 'network';
  current: number;
  allocated: number;
  available: number;
  cost: number;
  metrics: {
    utilization: number;
    throughput: number;
    latency: number;
  };
}

interface UserMetric {
  id: string;
  metric: string;
  value: number;
  previousValue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

interface CostMetric {
  id: string;
  service: string;
  currentCost: number;
  projectedCost: number;
  lastMonth: number;
  change: number;
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

const PerformanceAnalytics = () => {
  const [timeRange, setTimeRange] = useState('24h');

  // Sample system metrics
  const systemMetrics: SystemMetric[] = [
    {
      id: '1',
      name: 'CPU Usage',
      value: 65.5,
      unit: '%',
      trend: 'up',
      change: 5.2,
      threshold: {
        warning: 75,
        critical: 90,
      },
      history: [
        { timestamp: '2025-01-31T06:00:00', value: 65.5 },
        { timestamp: '2025-01-31T05:45:00', value: 62.3 },
        { timestamp: '2025-01-31T05:30:00', value: 60.1 },
      ],
    },
    {
      id: '2',
      name: 'Memory Usage',
      value: 72.8,
      unit: '%',
      trend: 'stable',
      change: 0.5,
      threshold: {
        warning: 80,
        critical: 95,
      },
      history: [
        { timestamp: '2025-01-31T06:00:00', value: 72.8 },
        { timestamp: '2025-01-31T05:45:00', value: 72.5 },
        { timestamp: '2025-01-31T05:30:00', value: 72.3 },
      ],
    },
  ];

  // Sample resource usage
  const resources: ResourceUsage[] = [
    {
      id: '1',
      name: 'API Server',
      type: 'compute',
      current: 65.5,
      allocated: 80,
      available: 20,
      cost: 125.50,
      metrics: {
        utilization: 75.5,
        throughput: 1250,
        latency: 45,
      },
    },
    {
      id: '2',
      name: 'Database Cluster',
      type: 'memory',
      current: 72.8,
      allocated: 90,
      available: 10,
      cost: 250.75,
      metrics: {
        utilization: 82.5,
        throughput: 850,
        latency: 85,
      },
    },
  ];

  // Sample user metrics
  const userMetrics: UserMetric[] = [
    {
      id: '1',
      metric: 'Active Users',
      value: 1250,
      previousValue: 1150,
      change: 8.7,
      trend: 'up',
      period: '24h',
    },
    {
      id: '2',
      metric: 'Response Time',
      value: 125,
      previousValue: 135,
      change: -7.4,
      trend: 'down',
      period: '24h',
    },
  ];

  // Sample cost metrics
  const costMetrics: CostMetric[] = [
    {
      id: '1',
      service: 'Compute Resources',
      currentCost: 1250.50,
      projectedCost: 1500.00,
      lastMonth: 1150.25,
      change: 8.7,
      breakdown: [
        {
          category: 'API Servers',
          amount: 750.25,
          percentage: 60,
        },
        {
          category: 'Background Workers',
          amount: 500.25,
          percentage: 40,
        },
      ],
    },
    {
      id: '2',
      service: 'Storage',
      currentCost: 850.25,
      projectedCost: 925.00,
      lastMonth: 800.50,
      change: 6.2,
      breakdown: [
        {
          category: 'Database',
          amount: 550.15,
          percentage: 65,
        },
        {
          category: 'Object Storage',
          amount: 300.10,
          percentage: 35,
        },
      ],
    },
  ];

  const getMetricTrendColor = (trend: 'up' | 'down' | 'stable', isPositive: boolean) => {
    if (trend === 'stable') return 'text-blue-500';
    return trend === 'up'
      ? isPositive
        ? 'text-green-500'
        : 'text-red-500'
      : isPositive
      ? 'text-red-500'
      : 'text-green-500';
  };

  const getResourceTypeIcon = (type: ResourceUsage['type']) => {
    switch (type) {
      case 'compute':
        return <Cpu className="h-4 w-4" />;
      case 'memory':
        return <LucideMemoryStick className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      case 'network':
        return <Network className="h-4 w-4" />;
      default:
        return <Cpu className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">
            Monitor system performance and resource utilization
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
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {systemMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{metric.name}</h3>
                </div>
                <Badge
                  variant="outline"
                  className={
                    metric.value >= metric.threshold.critical
                      ? 'bg-red-50 text-red-700'
                      : metric.value >= metric.threshold.warning
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-green-50 text-green-700'
                  }
                >
                  {metric.value >= metric.threshold.critical
                    ? 'Critical'
                    : metric.value >= metric.threshold.warning
                    ? 'Warning'
                    : 'Normal'}
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-2">
                {metric.value}
                {metric.unit}
              </div>
              <div className="flex items-center gap-2 text-sm">
                {metric.trend === 'up' ? (
                  <TrendingUp
                    className={`h-4 w-4 ${getMetricTrendColor(
                      metric.trend,
                      false
                    )}`}
                  />
                ) : metric.trend === 'down' ? (
                  <TrendingDown
                    className={`h-4 w-4 ${getMetricTrendColor(
                      metric.trend,
                      true
                    )}`}
                  />
                ) : (
                  <Activity className="h-4 w-4 text-blue-500" />
                )}
                <span
                  className={getMetricTrendColor(metric.trend, false)}
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}%
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Resource Usage</h2>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </div>
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="p-4 bg-muted rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getResourceTypeIcon(resource.type)}
                        <span className="font-medium">{resource.name}</span>
                        <Badge variant="secondary">{resource.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${resource.cost.toFixed(2)}/hour</span>
                        </div>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Utilization
                        </p>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="text-xl font-bold">
                            {resource.metrics.utilization}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Throughput
                        </p>
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-green-500" />
                          <span className="text-xl font-bold">
                            {resource.metrics.throughput} req/s
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Latency
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-xl font-bold">
                            {resource.metrics.latency}ms
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Metrics */}
        <div className="col-span-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">User Metrics</h2>
              <div className="space-y-4">
                {userMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="p-4 bg-muted rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{metric.metric}</span>
                      </div>
                      {metric.trend === 'up' ? (
                        <TrendingUp
                          className={`h-4 w-4 ${getMetricTrendColor(
                            metric.trend,
                            true
                          )}`}
                        />
                      ) : (
                        <TrendingDown
                          className={`h-4 w-4 ${getMetricTrendColor(
                            metric.trend,
                            false
                          )}`}
                        />
                      )}
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={getMetricTrendColor(metric.trend, true)}
                      >
                        {metric.change > 0 ? '+' : ''}
                        {metric.change}%
                      </span>
                      <span className="text-muted-foreground">
                        vs last {metric.period}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Analysis */}
        <div className="col-span-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Cost Analysis</h2>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Set Alerts
                </Button>
              </div>
              <div className="space-y-6">
                {costMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="p-4 bg-muted rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{metric.service}</h3>
                        <p className="text-sm text-muted-foreground">
                          Current cost: ${metric.currentCost.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Projected</p>
                          <p className="font-medium">
                            ${metric.projectedCost.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">vs Last Month</p>
                          <div className="flex items-center gap-1">
                            {metric.change > 0 ? (
                              <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-green-500" />
                            )}
                            <span
                              className={
                                metric.change > 0
                                  ? 'text-red-500'
                                  : 'text-green-500'
                              }
                            >
                              {metric.change > 0 ? '+' : ''}
                              {metric.change}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {metric.breakdown.map((item) => (
                        <div
                          key={item.category}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-sm">{item.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              ${item.amount.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({item.percentage}%)
                            </span>
                          </div>
                        </div>
                      ))}
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

export default PerformanceAnalytics;
