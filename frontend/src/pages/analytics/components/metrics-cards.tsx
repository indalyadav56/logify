import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Activity, AlertTriangle, Clock, Database } from "lucide-react";

export function MetricsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,350,789</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUp className="mr-1 h-4 w-4" />
            350K new logs
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0.8%</div>
          <p className="text-xs text-muted-foreground">
            -0.3% from last month
          </p>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowDown className="mr-1 h-4 w-4" />
            Decreased errors
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">235ms</div>
          <p className="text-xs text-muted-foreground">
            +15ms from last month
          </p>
          <div className="mt-4 flex items-center text-sm text-yellow-600">
            <ArrowUp className="mr-1 h-4 w-4" />
            Slight increase
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">99.99%</div>
          <p className="text-xs text-muted-foreground">
            +0.1% from last month
          </p>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUp className="mr-1 h-4 w-4" />
            Optimal performance
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
