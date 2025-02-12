import { useState, useMemo, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Filter,
  Clock,
  AlertCircle,
  Info,
  BarChart2,
  Calendar,
  Download,
  RefreshCcw,
  ChevronDown,
  Play,
  Pause,
  Group,
  Keyboard,
  SplitSquareVertical,
  Maximize2,
  LineChart,
  PieChart,
  Table2,
  Share2,
  BookmarkPlus,
  Trash2,
} from "lucide-react";
import { useLogData } from "@/hooks/useLogData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { addHours, format, parseISO, subHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Log {
  service: string;
  level: string;
  message: string;
  metadata: Record<string, any>;
  timestamp: string;
}

interface LogStats {
  name: string;
  count: number;
}

export default function LogExplorer() {
  const { logs } = useLogData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [timeRange, setTimeRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subHours(new Date(), 24),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState("logs");
  const [selectedMetadataFields, setSelectedMetadataFields] = useState<string[]>([]);
  const [isLiveTail, setIsLiveTail] = useState(false);
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<Array<{
    name: string;
    filters: any;
  }>>([]);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "full">("split");
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);

  // Get unique metadata fields from all logs
  const metadataFields = useMemo(() => {
    const fields = new Set<string>();
    logs.forEach((log) => {
      Object.keys(log.metadata).forEach((key) => fields.add(key));
    });
    return Array.from(fields);
  }, [logs]);

  // Filter logs based on all criteria
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        selectedLevel === "all" || log.level.toLowerCase() === selectedLevel.toLowerCase();

      const matchesService =
        selectedService === "all" ||
        log.service.toLowerCase() === selectedService.toLowerCase();

      const timestamp = parseISO(log.timestamp);
      const matchesTimeRange =
        timestamp >= timeRange.from && timestamp <= timeRange.to;

      return matchesSearch && matchesLevel && matchesService && matchesTimeRange;
    });
  }, [logs, searchTerm, selectedLevel, selectedService, timeRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const levelStats: LogStats[] = [];
    const serviceStats: LogStats[] = [];
    const levelCount: Record<string, number> = {};
    const serviceCount: Record<string, number> = {};

    filteredLogs.forEach((log) => {
      levelCount[log.level] = (levelCount[log.level] || 0) + 1;
      serviceCount[log.service] = (serviceCount[log.service] || 0) + 1;
    });

    Object.entries(levelCount).forEach(([level, count]) => {
      levelStats.push({ name: level, count });
    });

    Object.entries(serviceCount).forEach(([service, count]) => {
      serviceStats.push({ name: service, count });
    });

    return { levelStats, serviceStats };
  }, [filteredLogs]);

  // Group logs by specified field
  const groupedLogs = useMemo(() => {
    if (!groupBy) return null;

    return filteredLogs.reduce((acc, log) => {
      const key = groupBy === "service" ? log.service : 
                 groupBy === "level" ? log.level :
                 log.metadata[groupBy] || "undefined";
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(log);
      return acc;
    }, {} as Record<string, typeof filteredLogs>);
  }, [filteredLogs, groupBy]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault();
            setShowKeyboardShortcuts(true);
            break;
          case "f":
            e.preventDefault();
            document.querySelector<HTMLInputElement>('input[placeholder="Search logs..."]')?.focus();
            break;
          case "l":
            e.preventDefault();
            setIsLiveTail(prev => !prev);
            break;
          case "s":
            e.preventDefault();
            handleSaveCurrentFilter();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Live tail functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLiveTail) {
      interval = setInterval(() => {
        // Simulate new logs in development
        const newLog = {
          service: "live_tail_service",
          level: ["info", "warn", "error"][Math.floor(Math.random() * 3)],
          message: "New live log entry " + new Date().toISOString(),
          metadata: {
            timestamp: new Date().toISOString(),
            random_value: Math.random(),
          },
          timestamp: new Date().toISOString(),
        };
        setLogs(prev => [newLog, ...prev].slice(0, 1000)); // Keep last 1000 logs
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLiveTail]);

  const getLevelColor = (level: string) => {
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

  const getLevelIcon = (level: string) => {
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

  const exportLogs = () => {
    const exportData = filteredLogs.map((log) => ({
      ...log,
      metadata: JSON.stringify(log.metadata),
    }));
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Timestamp", "Service", "Level", "Message", "Metadata"].join(","),
        ...exportData.map((log) =>
          [
            log.timestamp,
            log.service,
            log.level,
            `"${log.message.replace(/"/g, '""')}"`,
            `"${log.metadata.replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `logs_export_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveCurrentFilter = () => {
    const filterName = prompt("Enter a name for this filter:");
    if (filterName) {
      setSavedFilters(prev => [...prev, {
        name: filterName,
        filters: {
          searchTerm,
          selectedLevel,
          selectedService,
          timeRange,
          selectedMetadataFields,
        }
      }]);
      toast.success("Filter saved successfully!");
    }
  };

  const applyFilter = (filter: any) => {
    setSearchTerm(filter.filters.searchTerm);
    setSelectedLevel(filter.filters.selectedLevel);
    setSelectedService(filter.filters.selectedService);
    setTimeRange(filter.filters.timeRange);
    setSelectedMetadataFields(filter.filters.selectedMetadataFields);
    toast.success("Filter applied successfully!");
  };

  const shareSelectedLogs = () => {
    const selectedLogs = filteredLogs.filter((_, index) => selectedLogIds.includes(index.toString()));
    const shareUrl = `${window.location.origin}/share?logs=${encodeURIComponent(JSON.stringify(selectedLogs))}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share URL copied to clipboard!");
  };

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
          <DatePickerWithRange
            date={{
              from: timeRange.from,
              to: timeRange.to,
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setTimeRange({ from: range.from, to: range.to });
              }
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Group By <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setGroupBy(null)}>
                No Grouping
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy("service")}>
                Service
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy("level")}>
                Log Level
              </DropdownMenuItem>
              {metadataFields.map(field => (
                <DropdownMenuItem key={field} onClick={() => setGroupBy(field)}>
                  {field}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {metadataFields.map((field) => (
                <DropdownMenuItem
                  key={field}
                  onClick={() => {
                    setSelectedMetadataFields((prev) =>
                      prev.includes(field)
                        ? prev.filter((f) => f !== field)
                        : [...prev, field]
                    );
                  }}
                >
                  {field}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant={isLiveTail ? "default" : "outline"}
            size="icon"
            onClick={() => setIsLiveTail(!isLiveTail)}
            title="Live Tail (Ctrl+L)"
          >
            {isLiveTail ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(prev => prev === "split" ? "full" : "split")}
          >
            {viewMode === "split" ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <SplitSquareVertical className="h-4 w-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <BarChart2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Chart Type</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setChartType("bar")}>
                Bar Chart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType("line")}>
                Line Chart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType("pie")}>
                Pie Chart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowKeyboardShortcuts(true)}
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                More <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleSaveCurrentFilter}>
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Save Current Filter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareSelectedLogs}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Selected Logs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportLogs}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Logs
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
              {savedFilters.map((filter, index) => (
                <DropdownMenuItem key={index} onClick={() => applyFilter(filter)}>
                  {filter.name}
                  <Trash2
                    className="ml-2 h-4 w-4 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSavedFilters(prev => prev.filter((_, i) => i !== index));
                    }}
                  />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content with enhanced features */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="flex gap-4 mt-0 flex-1">
          {/* Left Panel - Log List */}
          <div className="flex flex-col w-1/2">
            <ScrollArea className="flex-1 rounded-md border">
              <div className="space-y-2 p-4">
                {filteredLogs.map((log, index) => (
                  <Card
                    key={index}
                    className={`p-4 cursor-pointer hover:bg-accent ${
                      selectedLog === log ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedLog(log)}
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
                        {format(parseISO(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
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
          </div>

          {/* Right Panel - Log Details */}
          <Card className="w-1/2 p-4">
            {selectedLog ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Log Details</h3>
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(selectedLog.timestamp), "MMM dd, yyyy HH:mm:ss")}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Service:</span> {selectedLog.service}
                  </div>
                  <div>
                    <span className="font-medium">Level:</span>{" "}
                    <span className={getLevelColor(selectedLog.level)}>
                      {selectedLog.level.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Message:</span> {selectedLog.message}
                  </div>
                  <div>
                    <span className="font-medium">Metadata:</span>
                    <div className="mt-2 p-4 rounded-md bg-muted">
                      <JsonView data={selectedLog.metadata} />
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
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <div className="grid grid-cols-2 gap-4">
            {/* Enhanced visualization options */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Log Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" && (
                    <BarChart data={statistics.levelStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  )}
                  {chartType === "line" && (
                    <RechartsLineChart data={statistics.levelStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" />
                    </RechartsLineChart>
                  )}
                  {chartType === "pie" && (
                    <RechartsPieChart>
                      <Pie
                        data={statistics.levelStats}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#3b82f6"
                      >
                        {statistics.levelStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={["#3b82f6", "#ef4444", "#f59e0b"][index % 3]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Services Chart */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Services Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statistics.serviceStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Summary Statistics */}
            <Card className="p-4 col-span-2">
              <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="text-sm text-muted-foreground">Total Logs</div>
                  <div className="text-2xl font-bold">{filteredLogs.length}</div>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950">
                  <div className="text-sm text-muted-foreground">Error Logs</div>
                  <div className="text-2xl font-bold">
                    {statistics.levelStats.find((s) => s.name === "error")?.count || 0}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                  <div className="text-sm text-muted-foreground">Warning Logs</div>
                  <div className="text-2xl font-bold">
                    {statistics.levelStats.find((s) => s.name === "warn")?.count || 0}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="text-sm text-muted-foreground">Info Logs</div>
                  <div className="text-2xl font-bold">
                    {statistics.levelStats.find((s) => s.name === "info")?.count || 0}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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