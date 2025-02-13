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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { AlertTriangle, Wand2, Settings2, History, BookMarked, Share, Cpu, Network, Database } from "lucide-react";

interface Log {
  id: string;
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

interface LogAlert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  notifyVia: string[];
}

interface SavedQuery {
  id: string;
  name: string;
  query: string;
  filters: any;
  createdAt: Date;
}

interface LogPattern {
  id: string;
  pattern: string;
  frequency: number;
  severity: string;
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
  const [alerts, setAlerts] = useState<LogAlert[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [logPatterns, setLogPatterns] = useState<LogPattern[]>([]);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("15m");
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["timestamp", "level", "service", "message"]);
  const [logRetention, setLogRetention] = useState<number>(30); // days
  const [aggregationPeriod, setAggregationPeriod] = useState<string>("1h");
  const [advancedFilters, setAdvancedFilters] = useState({
    regex: "",
    excludePattern: "",
    caseSensitive: false,
    showNestedJson: true,
    highlightMatches: true,
  });
  const [metrics, setMetrics] = useState({
    ingestedLogsPerSecond: 0,
    storageUsed: 0,
    queryLatency: 0,
    activeQueries: 0,
  });

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
          id: Math.random().toString(),
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

  // Advanced filtering options
  // const [advancedFilters, setAdvancedFilters] = useState({
  //   regex: "",
  //   excludePattern: "",
  //   caseSensitive: false,
  //   showNestedJson: true,
  //   highlightMatches: true,
  // });

  // // Performance metrics
  // const [metrics, setMetrics] = useState({
  //   ingestedLogsPerSecond: 0,
  //   storageUsed: 0,
  //   queryLatency: 0,
  //   activeQueries: 0,
  // });

  // AI-powered features
  const generateLogInsights = useCallback(() => {
    // Implement AI analysis logic here
    return {
      anomalies: [],
      patterns: [],
      recommendations: [],
    };
  }, [filteredLogs]);

  // Enhanced log processing
  const processedLogs = useMemo(() => {
    return filteredLogs.map(log => ({
      ...log,
      parsed: JSON.stringify(log.metadata, null, 2),
      severity: getSeverityScore(log.level),
      correlationId: log.metadata?.correlationId,
      duration: log.metadata?.duration,
    }));
  }, [filteredLogs]);

  // Advanced grouping and analysis
  const logAnalytics = useMemo(() => {
    return {
      trendsOverTime: calculateTrends(filteredLogs),
      errorPatterns: detectErrorPatterns(filteredLogs),
      performanceMetrics: analyzePerformance(filteredLogs),
      systemHealth: calculateSystemHealth(filteredLogs),
    };
  }, [filteredLogs]);

  // Render functions for new UI components
  const renderAdvancedFilters = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Advanced Filtering Options</SheetTitle>
          <SheetDescription>Configure complex log filtering rules</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Regex Pattern</Label>
            <Input
              placeholder="Enter regex pattern"
              value={advancedFilters.regex}
              onChange={(e) => setAdvancedFilters(prev => ({...prev, regex: e.target.value}))}
            />
          </div>
          <div className="space-y-2">
            <Label>Exclude Pattern</Label>
            <Input
              placeholder="Enter exclude pattern"
              value={advancedFilters.excludePattern}
              onChange={(e) => setAdvancedFilters(prev => ({...prev, excludePattern: e.target.value}))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={advancedFilters.caseSensitive}
              onCheckedChange={(checked) => setAdvancedFilters(prev => ({...prev, caseSensitive: checked}))}
            />
            <Label>Case Sensitive</Label>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  const renderMetricsPanel = () => (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4" />
          <div className="text-sm font-medium">Ingestion Rate</div>
        </div>
        <div className="text-2xl font-bold">{metrics.ingestedLogsPerSecond}/s</div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Network className="h-4 w-4" />
          <div className="text-sm font-medium">Query Latency</div>
        </div>
        <div className="text-2xl font-bold">{metrics.queryLatency}ms</div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Cpu className="h-4 w-4" />
          <div className="text-sm font-medium">Active Queries</div>
        </div>
        <div className="text-2xl font-bold">{metrics.activeQueries}</div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4" />
          <div className="text-sm font-medium">Storage Used</div>
        </div>
        <div className="text-2xl font-bold">{formatBytes(metrics.storageUsed)}</div>
      </Card>
    </div>
  );

  const renderAIInsights = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wand2 className="h-4 w-4" />
          AI Insights
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>AI-Powered Log Analysis</DialogTitle>
          <DialogDescription>
            Automated insights and anomaly detection
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="anomalies">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Detected Anomalies
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {/* Render anomalies */}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="patterns">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Log Patterns
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {/* Render patterns */}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="recommendations">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Recommendations
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {/* Render recommendations */}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );

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

  return (
    <div className="h-full flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          {renderAdvancedFilters()}
          <DatePickerWithRange
            date={timeRange}
            setDate={setTimeRange}
          />
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          {renderAIInsights()}
          <Button variant="outline" className="gap-2" onClick={() => setIsLiveTail(!isLiveTail)}>
            {isLiveTail ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            Live Tail
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setViewMode(viewMode === "split" ? "full" : "split")}>
                  <SplitSquareVertical className="h-4 w-4 mr-2" />
                  Toggle Split View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)}>
                  <Keyboard className="h-4 w-4 mr-2" />
                  Keyboard Shortcuts
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tools</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {renderMetricsPanel()}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="flex-1">
          <div className="grid grid-cols-2 gap-4" style={{ height: "calc(100vh - 280px)" }}>
            <Card className="col-span-2 lg:col-span-1">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {processedLogs.map((log) => (
                    <Card
                      key={log.id}
                      className={`p-2 cursor-pointer hover:bg-accent ${
                        selectedLog?.id === log.id ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={log.level.toLowerCase() as any}>
                            {log.level}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(log.timestamp), "HH:mm:ss")}
                          </span>
                        </div>
                        <Badge variant="outline">{log.service}</Badge>
                      </div>
                      <p className="mt-1 text-sm">{log.message}</p>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {selectedLog ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Log Details</h3>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                          <Button variant="outline" size="sm">
                            <BookMarked className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Timestamp</Label>
                            <Input
                              value={format(parseISO(selectedLog.timestamp), "yyyy-MM-dd HH:mm:ss")}
                              readOnly
                            />
                          </div>
                          <div>
                            <Label>Service</Label>
                            <Input value={selectedLog.service} readOnly />
                          </div>
                        </div>
                        <div>
                          <Label>Message</Label>
                          <Textarea value={selectedLog.message} readOnly />
                        </div>
                        <div>
                          <Label>Metadata</Label>
                          <Card className="p-2">
                            <JsonView data={selectedLog.metadata} />
                          </Card>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Select a log to view details
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
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

// Utility functions
const getSeverityScore = (level: string): number => {
  const scores: Record<string, number> = {
    ERROR: 4,
    WARN: 3,
    INFO: 2,
    DEBUG: 1,
  };
  return scores[level.toUpperCase()] || 0;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const calculateTrends = (logs: Log[]) => {
  // Implement trend analysis
  return [];
};

const detectErrorPatterns = (logs: Log[]) => {
  // Implement error pattern detection
  return [];
};

const analyzePerformance = (logs: Log[]) => {
  // Implement performance analysis
  return {};
};

const calculateSystemHealth = (logs: Log[]) => {
  // Implement system health calculation
  return {};
};