import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import {
  Search,
  Clock,
  AlertCircle,
  Info,
} from "lucide-react";
import { useLogData } from "@/hooks/useLogData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, subHours } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios"


interface TimeRange {
  from: Date;
  to: Date;
}

interface SavedFilter {
  name: string;
  filters: {
    searchTerm: string;
    level: string;
    service: string;
    timeRange: TimeRange;
    metadataFields: string[];
  };
}

export default function LogExplorer() {
  // const { logs } = useLogData();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [logs, setLogs] = useState([]);
  const [selectedMetadataFields, setSelectedMetadataFields] = useState<string[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);

  // Get unique metadata fields from all logs
  const metadataFields = useMemo(() => {
    const fields = new Set<string>();
    // logs.forEach((log) => {
    //   Object.keys(log?.metadata).forEach((key) => fields.add(key));
    // });
    return Array.from(fields);
  }, [logs]);

  const getLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case "error":
        return "text-red-500";
      case "warn":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getLevelIcon = (level: string): JSX.Element => {
    switch (level.toLowerCase()) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warn":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    axios.post('http://localhost:8080/v1/logs/search', {}, {
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0X2lkIjoiYTdjMDI4MjYtMDA1YS00Y2MxLWE0ZWYtYmMxNjJjY2ZjYWFhIiwidGVuYW50X2lkIjoiZDliZGZjMDYtYWMxYi00MTU5LTg1ZWEtMTNmODVhNjJiNzQ0IiwidXNlcl9pZCI6ImRjZmYxNjFjLWI4YmUtNGRiNS1iYjMzLWFjNjBlMTVmNDM4MiJ9.zlrqHhCe0KErS_-8QOQgla3WWP528G2YjooeU2jIsYk`
      }
    }).then((response) => {
      console.log("INDAL",response.data.data)
      setLogs(response.data.data)
    });
  },[])

  return (
    <div className="flex flex-col h-screen gap-4 p-4">
      {/* Header with enhanced controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="user_service">User Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </div>

      <div className="flex overflow-hidden">
        <ScrollArea className="flex-1 rounded-md border w-1/2">
          <div className="space-y-2 p-4">
            {logs.map((log, index) => (
              <Card
                key={index}
                className={`p-4 cursor-pointer hover:bg-accent`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(log.level)}
                    <span className={`font-medium ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {log.service}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {/* {format(parseISO(log.timestamp), "MMM dd, yyyy HH:mm:ss")} */}
                  </div>
                </div>
                <p className="mt-2 text-sm">{log.message}</p>
                {selectedMetadataFields.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {selectedMetadataFields.map((field) => (
                      <div key={field} className="flex gap-2">
                        <span className="font-medium">{field}:</span>
                        <span>{JSON.stringify(log.metadata[field])}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
        <ScrollArea className="flex-1 rounded-md border w-1/2">
          <Card className="p-4">
            {logs.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Log Details</h3>
                  <span className="text-sm text-muted-foreground">
                    {/* {format(parseISO(selectedLog.timestamp), "MMM dd, yyyy HH:mm:ss")} */}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Service:</span> {logs[0].service}
                  </div>
                  <div>
                    <span className="font-medium">Level:</span>{" "}
                    <span className={getLevelColor(logs[0].level)}>
                      {logs[0].level.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Message:</span> {logs[0].message}
                  </div>
                  <div>
                    <span className="font-medium">Metadata:</span>
                    <div className="mt-2 p-4 rounded-md bg-muted">
                      <JsonView data={logs[0].metadata} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a log to view details
              </div>
            )}
          </Card>
        </ScrollArea>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these shortcuts to quickly navigate and control the log explorer
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span>Search</span>
              <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘ + F</kbd>
            </div>
            <div className="flex justify-between">
              <span>Live Tail</span>
              <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘ + L</kbd>
            </div>
            <div className="flex justify-between">
              <span>Save Filter</span>
              <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘ + S</kbd>
            </div>
            <div className="flex justify-between">
              <span>Show Shortcuts</span>
              <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘ + K</kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}