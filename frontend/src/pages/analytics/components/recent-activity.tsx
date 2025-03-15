import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const recentActivity = [
  {
    id: "1",
    timestamp: "2 minutes ago",
    event: "API Authentication Failed",
    source: "api-server-1",
    status: "error",
    user: {
      name: "John Doe",
      email: "john@example.com",
      image: "https://github.com/shadcn.png",
    },
  },
  {
    id: "2",
    timestamp: "5 minutes ago",
    event: "Database Connection Successful",
    source: "db-primary",
    status: "success",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      image: "https://github.com/shadcn.png",
    },
  },
  {
    id: "3",
    timestamp: "10 minutes ago",
    event: "Cache Cleared",
    source: "redis-cache",
    status: "info",
    user: {
      name: "Mike Johnson",
      email: "mike@example.com",
      image: "https://github.com/shadcn.png",
    },
  },
  {
    id: "4",
    timestamp: "15 minutes ago",
    event: "Worker Process Crashed",
    source: "worker-2",
    status: "error",
    user: {
      name: "Sarah Wilson",
      email: "sarah@example.com",
      image: "https://github.com/shadcn.png",
    },
  },
  {
    id: "5",
    timestamp: "20 minutes ago",
    event: "New User Registered",
    source: "auth-service",
    status: "success",
    user: {
      name: "Tom Brown",
      email: "tom@example.com",
      image: "https://github.com/shadcn.png",
    },
  },
];

export function RecentActivity() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentActivity.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.image} />
                  <AvatarFallback>
                    {activity.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {activity.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activity.user.email}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell>{activity.event}</TableCell>
            <TableCell>{activity.source}</TableCell>
            <TableCell>{activity.timestamp}</TableCell>
            <TableCell>
              <Badge
                variant={
                  activity.status === "error"
                    ? "destructive"
                    : activity.status === "success"
                    ? "default"
                    : "secondary"
                }
              >
                {activity.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
