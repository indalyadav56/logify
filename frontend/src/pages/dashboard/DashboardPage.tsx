import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { time: '00:00', logs: 200, errors: 2 },
  { time: '04:00', logs: 300, errors: 3 },
  { time: '08:00', logs: 400, errors: 4 },
  { time: '12:00', logs: 1200, errors: 6 },
  { time: '16:00', logs: 800, errors: 4 },
  { time: '20:00', logs: 600, errors: 3 },
  { time: '24:00', logs: 400, errors: 2 },
]

const systemStatus = [
  {
    name: "API Server",
    status: "operational",
    responseTime: "34ms",
    uptime: "98%",
  },
  {
    name: "Database",
    status: "operational",
    responseTime: "25ms",
    uptime: "99%",
  },
  {
    name: "Cache",
    status: "operational",
    responseTime: "12ms",
    uptime: "100%",
  },
  {
    name: "Worker",
    status: "degraded",
    responseTime: "150ms",
    uptime: "85%",
  },
  {
    name: "Storage",
    status: "operational",
    responseTime: "28ms",
    uptime: "97%",
  },
]

export function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">
              99.99% uptime
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15/15</div>
            <p className="text-xs text-muted-foreground">
              All services running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45ms</div>
            <p className="text-xs text-muted-foreground">
              -5ms from last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.02%</div>
            <p className="text-xs text-muted-foreground">
              -0.01% last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Log Activity Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Log Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="logs" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {service.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Response Time: {service.responseTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`h-2 w-2 rounded-full ${
                        service.status === 'operational' 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`} 
                    />
                    <span className="text-sm font-medium">{service.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr,100px,200px,1fr,100px] gap-4 text-sm font-medium text-muted-foreground">
              <div>Timestamp</div>
              <div>Level</div>
              <div>Service</div>
              <div>Message</div>
              <div>Trace ID</div>
            </div>
            <div className="grid grid-cols-[1fr,100px,200px,1fr,100px] gap-4 text-sm">
              <div>2024-02-15 22:34:45</div>
              <div>
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-600">
                  ERROR
                </span>
              </div>
              <div>API Server</div>
              <div>Failed to authenticate user request</div>
              <div className="font-mono">auth-service-xyz</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
