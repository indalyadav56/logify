import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Server,
} from "lucide-react";

export function DashboardMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold">Healthy</p>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </div>
            {/* <Badge variant="secondary" className="whitespace-nowrap">
              99.99% uptime
            </Badge> */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Services</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold">15/15</p>
              <p className="text-xs text-muted-foreground">Services running</p>
            </div>
            <div className="flex items-center text-green-500 text-sm">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              All active
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold">45ms</p>
              <p className="text-xs text-muted-foreground">Average latency</p>
            </div>
            <div className="flex items-center text-green-500 text-sm">
              <ArrowDown className="mr-1 h-4 w-4" />
              -5ms
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold">0.02%</p>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </div>
            <div className="flex items-center text-green-500 text-sm">
              <ArrowDown className="mr-1 h-4 w-4" />
              -0.01%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
