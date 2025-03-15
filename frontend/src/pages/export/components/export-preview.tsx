import { useExportStore } from "@/store/useExportStore";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const sampleLogs = [
  {
    timestamp: "2025-02-16T07:15:23.456Z",
    level: "ERROR",
    service: "auth-service",
    message: "Failed to authenticate user: Invalid credentials",
    trace_id: "trace-abc-123",
    metadata: {
      user_id: "user-123",
      ip: "192.168.1.1",
    },
  },
  {
    timestamp: "2025-02-16T07:15:22.123Z",
    level: "INFO",
    service: "auth-service",
    message: "Login attempt",
    trace_id: "trace-abc-123",
    metadata: {
      user_id: "user-123",
      ip: "192.168.1.1",
    },
  },
];

export function ExportPreview() {
  const { currentFilters } = useExportStore();

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
    <div className="space-y-4">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Preview</AlertTitle>
        <AlertDescription>
          Showing sample logs matching your filter criteria. The actual export may
          contain more fields based on your selection.
        </AlertDescription>
      </Alert>

      <ScrollArea className="h-[400px] border rounded-md p-4">
        <div className="space-y-4">
          {sampleLogs.map((log, index) => (
            <div
              key={index}
              className="space-y-2 p-3 border rounded-md bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <Badge variant={getLevelColor(log.level)}>{log.level}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">{log.message}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{log.service}</span>
                  <span>•</span>
                  <span className="font-mono">{log.trace_id}</span>
                </div>
              </div>

              {currentFilters.include_metadata && (
                <div className="text-xs">
                  <p className="font-medium text-muted-foreground">Metadata:</p>
                  <pre className="mt-1 p-2 bg-muted rounded-md">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="text-sm text-muted-foreground">
        <p>Export Format: {currentFilters.format.toUpperCase()}</p>
        <p>
          Selected Fields:{" "}
          {currentFilters.fields?.join(", ") || "All fields"}
        </p>
      </div>
    </div>
  );
}
