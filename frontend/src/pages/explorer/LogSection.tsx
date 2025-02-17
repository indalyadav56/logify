import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import {
  AlertTriangle,
  Info,
  FileText,
  Share2,
  Download,
  Table,
  List,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimelineView } from "./components/TimelineView";
import { TableView } from "./components/TableView";
import { ListView } from "./components/ListView";
import { CompactView } from "./components/CompactView";
import LogSectionHeader from "./components/LogSectionHeader";

interface Log {
  id: string;
  message: string;
  level: string;
  service: string;
  timestamp: string;
  metadata: Record<string, string>;
  action?: string;
  file?: string;
  func_name?: string;
}

interface LogSectionProps {
  logs: Log[];
}

type ViewMode = "list" | "table" | "timeline" | "compact";
type Theme = "light" | "dark" | "system";

export default function LogSection({ logs }: LogSectionProps) {
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [timeFormat, setTimeFormat] = useState<"relative" | "absolute">(
    "relative"
  );
  const [bookmarkedLogs, setBookmarkedLogs] = useState<Set<string>>(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [quickFilter, setQuickFilter] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [theme, setTheme] = useState<Theme>("system");
  const [fontSize, setFontSize] = useState(14);
  const [compactMode, setCompactMode] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(["level", "message", "timestamp", "service"])
  );

  // Load user preferences from localStorage
  useEffect(() => {
    const loadPreferences = () => {
      const savedPrefs = localStorage.getItem("logifyPreferences");
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        setTheme(prefs.theme || "system");
        setFontSize(prefs.fontSize || 14);
        setCompactMode(prefs.compactMode || false);
        setShowLineNumbers(prefs.showLineNumbers || true);
        setVisibleColumns(
          new Set(
            prefs.visibleColumns || ["level", "message", "timestamp", "service"]
          )
        );
      }
    };
    loadPreferences();
  }, []);

  // Save user preferences
  const savePreferences = useCallback(() => {
    const prefs = {
      theme,
      fontSize,
      compactMode,
      showLineNumbers,
      visibleColumns: Array.from(visibleColumns),
    };
    localStorage.setItem("logifyPreferences", JSON.stringify(prefs));
    toast.success("Preferences saved successfully");
  }, [theme, fontSize, compactMode, showLineNumbers, visibleColumns]);

  // Calculate statistics
  useEffect(() => {
    const calculateStats = () => {
      const errorCount = logs.filter(
        (log) => log.level.toLowerCase() === "error"
      ).length;
      const warningCount = logs.filter(
        (log) => log.level.toLowerCase() === "warning"
      ).length;
      const infoCount = logs.filter(
        (log) => log.level.toLowerCase() === "info"
      ).length;

      // Calculate logs per minute
      const timestamps = logs.map((log) => new Date(log.timestamp).getTime());
      const timeRange = Math.max(...timestamps) - Math.min(...timestamps);
      const avgLogsPerMinute =
        timeRange > 0 ? logs.length / (timeRange / 60000) : 0;
    };
    calculateStats();
  }, [logs]);

  const filteredAndSortedLogs = logs
    .filter((log) => {
      if (showBookmarkedOnly && !bookmarkedLogs.has(log.id)) return false;
      if (quickFilter) {
        const searchTerm = quickFilter.toLowerCase();
        return (
          log.message.toLowerCase().includes(searchTerm) ||
          log.service.toLowerCase().includes(searchTerm) ||
          log.level.toLowerCase().includes(searchTerm) ||
          log.action?.toLowerCase().includes(searchTerm) ||
          log.file?.toLowerCase().includes(searchTerm) ||
          log.func_name?.toLowerCase().includes(searchTerm) ||
          Object.entries(log.metadata).some(
            ([key, value]) => key.toLowerCase().includes(searchTerm)
            // || value.toLowerCase().includes(searchTerm)
          )
        );
      }
      return true;
    })
    .sort((a, b) => {
      const comparison =
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sortOrder === "desc" ? comparison : -comparison;
    });

  const formatTimestamp = (timestamp: string) => {
    // if (timeFormat === "relative") {
    //   return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    // }
    return new Date(timestamp).toLocaleString();
  };

  const getLevelDetails = (level: string) => {
    switch (level.toUpperCase()) {
      case "ERROR":
        return {
          color: "bg-red-500/10 text-red-500 border-red-200",
          icon: <AlertTriangle className="h-4 w-4" />,
          borderColor: "#ef4444",
        };
      case "WARNING":
        return {
          color: "bg-yellow-500/10 text-yellow-500 border-yellow-200",
          icon: <AlertTriangle className="h-4 w-4" />,
          borderColor: "#f59e0b",
        };
      case "INFO":
        return {
          color: "bg-blue-500/10 text-blue-500 border-blue-200",
          icon: <Info className="h-4 w-4" />,
          borderColor: "#3b82f6",
        };
      default:
        return {
          color: "bg-gray-500/10 text-gray-500 border-gray-200",
          icon: <Info className="h-4 w-4" />,
          borderColor: "#6b7280",
        };
    }
  };

  if (logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-[400px] text-muted-foreground"
      >
        <FileText className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <p className="text-lg font-medium">No logs found</p>
        <p className="text-sm">Try adjusting your filters or search terms</p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <LogSectionHeader />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tabs
              defaultValue={viewMode}
              className="w-full"
              onValueChange={(value) => setViewMode(value as ViewMode)}
            >
              <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Table View
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger
                  value="compact"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Compact
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-4">
                <ScrollArea className="h-[calc(100vh-120px)] w-full p-4 w-full max-w-full">
                  <ListView
                    logs={filteredAndSortedLogs}
                    bookmarkedLogs={bookmarkedLogs}
                    setSelectedLog={setSelectedLog}
                    formatTimestamp={formatTimestamp}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="table" className="mt-4">
                <ScrollArea className="h-[calc(100vh-120px)] w-full p-4">
                  <TableView
                    logs={filteredAndSortedLogs}
                    bookmarkedLogs={bookmarkedLogs}
                    setSelectedLog={setSelectedLog}
                    formatTimestamp={formatTimestamp}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <ScrollArea className="h-[calc(100vh-120px)] p-4 w-full max-w-full">
                  <TimelineView
                    logs={filteredAndSortedLogs}
                    bookmarkedLogs={bookmarkedLogs}
                    setSelectedLog={setSelectedLog}
                    formatTimestamp={formatTimestamp}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="compact" className="mt-4">
                <ScrollArea className="h-[calc(100vh-120px)] p-4 w-full max-w-full">
                <CompactView
                  logs={filteredAndSortedLogs}
                  bookmarkedLogs={bookmarkedLogs}
                  setSelectedLog={setSelectedLog}
                  formatTimestamp={formatTimestamp}
                  />
              </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`flex items-center gap-1.5 ${
                    selectedLog && getLevelDetails(selectedLog.level).color
                  }`}
                >
                  {selectedLog && getLevelDetails(selectedLog.level).icon}
                  {selectedLog?.level}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {selectedLog?.service}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedLog && formatTimestamp(selectedLog.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 w-full">
            <div className="space-y-6 p-1">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Message</h4>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                    {selectedLog?.message}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Metadata</h4>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                    {selectedLog &&
                      JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>

              {(selectedLog?.action ||
                selectedLog?.file ||
                selectedLog?.func_name) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">
                    Additional Information
                  </h4>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="grid gap-2 text-sm font-mono">
                      {selectedLog?.action && (
                        <div className="grid grid-cols-[100px,1fr] gap-2">
                          <span className="font-semibold">Action:</span>
                          <span className="break-all">
                            {selectedLog.action}
                          </span>
                        </div>
                      )}
                      {selectedLog?.file && (
                        <div className="grid grid-cols-[100px,1fr] gap-2">
                          <span className="font-semibold">File:</span>
                          <span className="break-all">{selectedLog.file}</span>
                        </div>
                      )}
                      {selectedLog?.func_name && (
                        <div className="grid grid-cols-[100px,1fr] gap-2">
                          <span className="font-semibold">Function:</span>
                          <span className="break-all">
                            {selectedLog.func_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
