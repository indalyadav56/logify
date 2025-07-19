import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollText, AlertTriangle, Clock, Users } from "lucide-react";

export function ProjectOverview() {
  // const { projectId } = useParams()
  // const { currentProject } = useProjectStore()

  const stats = [
    {
      title: "Total Logs",
      value: "1,234",
      icon: ScrollText,
      description: "Last 30 days",
    },
    {
      title: "Error Rate",
      value: "2.4%",
      icon: AlertTriangle,
      description: "Last 24 hours",
    },
    {
      title: "Avg Response Time",
      value: "245ms",
      icon: Clock,
      description: "Last hour",
    },
    {
      title: "Active Users",
      value: "56",
      icon: Users,
      description: "Currently online",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest logs and events from your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add your activity list component here */}
          <div className="text-sm text-muted-foreground">
            No recent activity to display
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
