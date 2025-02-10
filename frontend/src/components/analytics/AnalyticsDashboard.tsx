import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  Database,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import LogVisualizer3D from "../visualizations/LogVisualizer3D";

const AnalyticsDashboard = () => {
  // Sample data for visualizations
  const performanceData = [
    { time: "00:00", logs: 1200, latency: 85, errors: 12 },
    { time: "04:00", logs: 800, latency: 90, errors: 8 },
    { time: "08:00", logs: 2500, latency: 120, errors: 25 },
    { time: "12:00", logs: 3500, latency: 95, errors: 35 },
    { time: "16:00", logs: 4500, latency: 110, errors: 45 },
    { time: "20:00", logs: 3000, latency: 100, errors: 30 },
  ];

  const resourceUsage = [
    { name: "Storage", value: 850, color: "#22c55e" },
    { name: "CPU", value: 120, color: "#ef4444" },
    { name: "Memory", value: 300, color: "#f59e0b" },
    { name: "Network", value: 200, color: "#3b82f6" },
  ];

  const metrics = [
    {
      title: "Total Logs",
      value: "1.2M",
      change: "+12.5%",
      trend: "up",
      icon: <Database className="h-4 w-4" />,
    },
    {
      title: "Avg Latency",
      value: "85ms",
      change: "-5.2%",
      trend: "down",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      title: "Error Rate",
      value: "0.05%",
      change: "-0.8%",
      trend: "down",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      title: "Active Users",
      value: "2,453",
      change: "+15%",
      trend: "up",
      icon: <Users className="h-4 w-4" />,
    },
  ];

  // Sample 3D visualization data
  const visualizationData = [
    {
      timestamp: Date.now() - 50000,
      severity: "info",
      category: "performance",
      value: 3,
    },
    {
      timestamp: Date.now() - 45000,
      severity: "warning",
      category: "security",
      value: 4,
    },
    {
      timestamp: Date.now() - 40000,
      severity: "error",
      category: "error",
      value: 2,
    },
    {
      timestamp: Date.now() - 35000,
      severity: "info",
      category: "performance",
      value: 5,
    },
    {
      timestamp: Date.now() - 30000,
      severity: "warning",
      category: "security",
      value: 3,
    },
    {
      timestamp: Date.now() - 25000,
      severity: "info",
      category: "performance",
      value: 4,
    },
    {
      timestamp: Date.now() - 20000,
      severity: "error",
      category: "error",
      value: 1,
    },
    {
      timestamp: Date.now() - 15000,
      severity: "info",
      category: "performance",
      value: 6,
    },
    {
      timestamp: Date.now() - 10000,
      severity: "warning",
      category: "security",
      value: 4,
    },
    {
      timestamp: Date.now() - 5000,
      severity: "info",
      category: "performance",
      value: 5,
    },
  ] as const;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your logging system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>
            <Brain className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div
                  className={`p-2 rounded-full bg-${
                    metric.trend === "up" ? "green" : "red"
                  }-100/10`}
                >
                  {metric.icon}
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant={metric.trend === "up" ? "default" : "destructive"}
                  size="sm"
                >
                  {metric.change}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="visualization">3D Visualization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Log volume, latency, and error rates over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="logs"
                        stroke="#2563eb"
                        strokeWidth={2}
                        name="Log Volume"
                      />
                      <Line
                        type="monotone"
                        dataKey="latency"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Latency"
                      />
                      <Line
                        type="monotone"
                        dataKey="errors"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Errors"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-6">
            {/* Latency Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Latency Distribution</CardTitle>
                <CardDescription>
                  Response time distribution across services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="latency"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.2}
                        name="Latency"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid gap-6">
            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>System resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resourceUsage}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {resourceUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {resourceUsage.map((resource, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: resource.color }}
                        />
                        <span className="text-sm">
                          {resource.name} ({resource.value}GB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visualization">
          <Card>
            <CardHeader>
              <CardTitle>3D Log Visualization</CardTitle>
              <CardDescription>
                Interactive 3D visualization of log patterns and relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <LogVisualizer3D
                  data={visualizationData}
                  width={800}
                  height={500}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Machine learning-driven analysis and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Performance Optimization */}
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Performance Patterns</h4>
                  <p className="text-sm text-muted-foreground">
                    Detected periodic latency spikes during peak hours. Consider
                    implementing caching to reduce database load.
                  </p>
                </div>
              </div>
            </Card>

            {/* Resource Optimization */}
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Server className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Resource Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Storage usage growing 25% faster than normal. Review log
                    retention policies and implement compression.
                  </p>
                </div>
              </div>
            </Card>

            {/* Security Insights */}
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-red-100 text-red-600">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Security Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Unusual authentication patterns detected from 3 IP ranges.
                    Consider implementing additional security measures.
                  </p>
                </div>
              </div>
            </Card>

            {/* Trend Analysis */}
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Trend Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Error rates showing upward trend in payment service.
                    Predictive analysis suggests potential issues in 24h.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
