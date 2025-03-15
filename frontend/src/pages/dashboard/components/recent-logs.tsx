import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const recentLogs = [
  {
    id: "1",
    timestamp: "2024-02-16 12:30:45",
    level: "ERROR",
    service: "API Server",
    message: "Failed to authenticate user request",
    trace: "auth-service-xyz",
  },
  {
    id: "2",
    timestamp: "2024-02-16 12:30:40",
    level: "INFO",
    service: "Worker",
    message: "Successfully processed batch job",
    trace: "worker-service-123",
  },
  {
    id: "3",
    timestamp: "2024-02-16 12:30:35",
    level: "WARN",
    service: "Database",
    message: "High CPU utilization detected",
    trace: "db-monitor-abc",
  },
  {
    id: "4",
    timestamp: "2024-02-16 12:30:30",
    level: "INFO",
    service: "Cache",
    message: "Cache invalidation completed",
    trace: "cache-service-456",
  },
  {
    id: "5",
    timestamp: "2024-02-16 12:30:25",
    level: "ERROR",
    service: "Storage",
    message: "Failed to upload file: insufficient permissions",
    trace: "storage-service-789",
  },
  {
    id: "6",
    timestamp: "2024-02-16 12:30:20",
    level: "INFO",
    service: "API Server",
    message: "New user registration successful",
    trace: "auth-service-xyz",
  },
];

export function RecentLogs() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "destructive";
      case "WARN":
        return "warning";
      case "INFO":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Trace ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-xs">
                {log.timestamp}
              </TableCell>
              <TableCell>
                <Badge variant={getLevelColor(log.level)}>{log.level}</Badge>
              </TableCell>
              <TableCell>{log.service}</TableCell>
              <TableCell className="max-w-[300px] truncate">
                {log.message}
              </TableCell>
              <TableCell className="font-mono text-xs">{log.trace}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
