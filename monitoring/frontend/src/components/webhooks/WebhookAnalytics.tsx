import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Clock, Activity, CheckCircle2, Zap } from "lucide-react";
import LogVisualizer3D from '../visualizations/LogVisualizer3D';

const WebhookAnalytics = () => {
  // Sample data for charts
  const triggerData = [
    { time: "00:00", triggers: 12 },
    { time: "04:00", triggers: 8 },
    { time: "08:00", triggers: 25 },
    { time: "12:00", triggers: 35 },
    { time: "16:00", triggers: 45 },
    { time: "20:00", triggers: 30 },
  ];

  const responseTimeData = [
    { time: "00:00", avg: 250 },
    { time: "04:00", avg: 300 },
    { time: "08:00", avg: 450 },
    { time: "12:00", avg: 280 },
    { time: "16:00", avg: 320 },
    { time: "20:00", avg: 290 },
  ];

  const statusData = [
    { name: "Success", value: 850, color: "#22c55e" },
    { name: "Failed", value: 120, color: "#ef4444" },
    { name: "Timeout", value: 30, color: "#f59e0b" },
  ];

  const metrics = [
    {
      title: "Total Triggers",
      value: "1,243",
      change: "+12.5%",
      trend: "up",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      title: "Avg Response Time",
      value: "285ms",
      change: "-5.2%",
      trend: "down",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      title: "Success Rate",
      value: "98.5%",
      change: "+0.8%",
      trend: "up",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      title: "Active Webhooks",
      value: "24",
      change: "+2",
      trend: "up",
      icon: <Activity className="h-4 w-4" />,
    },
  ];

  // Sample 3D visualization data
  const visualizationData = [
    { timestamp: Date.now() - 50000, severity: 'info', category: 'webhook', value: 3 },
    { timestamp: Date.now() - 45000, severity: 'warning', category: 'webhook', value: 4 },
    { timestamp: Date.now() - 40000, severity: 'error', category: 'webhook', value: 2 },
    { timestamp: Date.now() - 35000, severity: 'info', category: 'webhook', value: 5 },
    { timestamp: Date.now() - 30000, severity: 'warning', category: 'webhook', value: 3 },
    { timestamp: Date.now() - 25000, severity: 'info', category: 'webhook', value: 4 },
    { timestamp: Date.now() - 20000, severity: 'error', category: 'webhook', value: 1 },
    { timestamp: Date.now() - 15000, severity: 'info', category: 'webhook', value: 6 },
    { timestamp: Date.now() - 10000, severity: 'warning', category: 'webhook', value: 4 },
    { timestamp: Date.now() - 5000, severity: 'info', category: 'webhook', value: 5 },
  ] as const;

  return (
    <div className="space-y-6">
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
                <Badge
                  variant={metric.trend === "up" ? "default" : "destructive"}
                >
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trigger Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Trigger Timeline</CardTitle>
          <CardDescription>
            Number of webhook triggers over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={triggerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="triggers"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Analysis</CardTitle>
            <CardDescription>Average response time trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>
              Webhook execution status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {statusData.map((status, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm">
                      {status.name} ({status.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>3D Log Visualization</CardTitle>
          <CardDescription>
            Interactive 3D visualization of webhook activities and patterns
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
    </div>
  );
};

export default WebhookAnalytics;
