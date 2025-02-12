// import { useState, useMemo, useEffect, useCallback } from "react";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { JsonView } from "react-json-view-lite";
// import "react-json-view-lite/dist/index.css";
// import {
//   Search,
//   Filter,
//   Clock,
//   AlertCircle,
//   Info,
//   BarChart2,
//   Calendar,
//   Download,
//   RefreshCcw,
//   ChevronDown,
//   Play,
//   Pause,
//   Group,
//   Keyboard,
//   SplitSquareVertical,
//   Maximize2,
//   LineChart,
//   PieChart,
//   Table2,
//   Share2,
//   BookmarkPlus,
//   Trash2,
//   AlertOctagon,
//   Bug,
//   Cpu,
//   Database,
//   FileSearch,
//   GitBranch,
//   Network,
//   Shield,
//   Terminal,
//   Zap,
//   Layers,
//   Hash,
//   Workflow,
//   FileCode,
//   Code,
//   Plus,
// } from "lucide-react";
// import { useLogData } from "@/hooks/useLogData";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { DatePickerWithRange } from "@/components/ui/date-range-picker";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
//   DropdownMenuLabel,
//   DropdownMenuGroup,
// } from "@/components/ui/dropdown-menu";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   LineChart as RechartsLineChart,
//   Line,
//   PieChart as RechartsPieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import { addHours, format, parseISO, subHours } from "date-fns";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { toast } from "sonner";

// interface Log {
//   service: string;
//   level: string;
//   message: string;
//   metadata: Record<string, any>;
//   timestamp: string;
//   traceId?: string;
//   spanId?: string;
//   environment?: string;
//   host?: string;
//   version?: string;
//   correlationId?: string;
//   resourceId?: string;
//   tags?: string[];
// }

// interface LogStats {
//   name: string;
//   count: number;
// }

// const EXAMPLE_LOGS: Log[] = [
//   {
//     service: "auth-service",
//     level: "error",
//     message: "Failed login attempt for user john.doe@example.com",
//     metadata: {
//       ip: "192.168.1.100",
//       userAgent: "Mozilla/5.0",
//       attemptCount: 3,
//       errorCode: "AUTH_001"
//     },
//     timestamp: new Date().toISOString(),
//     traceId: "trace-123",
//     spanId: "span-456",
//     environment: "production",
//     host: "auth-server-01",
//     version: "2.1.0",
//     correlationId: "corr-789",
//     resourceId: "user-123",
//     tags: ["auth", "security", "failed-login"]
//   },
//   {
//     service: "payment-service",
//     level: "info",
//     message: "Payment processed successfully for order #12345",
//     metadata: {
//       orderId: "12345",
//       amount: 99.99,
//       currency: "USD",
//       paymentMethod: "credit_card"
//     },
//     timestamp: new Date(Date.now() - 5000).toISOString(),
//     traceId: "trace-456",
//     spanId: "span-789",
//     environment: "production",
//     host: "payment-server-02",
//     version: "1.5.0",
//     correlationId: "corr-012",
//     resourceId: "order-12345",
//     tags: ["payment", "success", "order"]
//   },
//   {
//     service: "inventory-service",
//     level: "warn",
//     message: "Low stock alert for product SKU-789",
//     metadata: {
//       productId: "SKU-789",
//       currentStock: 5,
//       threshold: 10,
//       warehouse: "WH-001"
//     },
//     timestamp: new Date(Date.now() - 15000).toISOString(),
//     traceId: "trace-789",
//     spanId: "span-012",
//     environment: "production",
//     host: "inventory-server-03",
//     version: "1.2.0",
//     correlationId: "corr-345",
//     resourceId: "product-789",
//     tags: ["inventory", "stock", "alert"]
//   }
// ];

// const EXAMPLE_ALERT_RULES = [
//   {
//     name: "High Error Rate",
//     condition: "error_count >",
//     threshold: 10,
//     timeWindow: "5m",
//     severity: "high",
//     enabled: true
//   },
//   {
//     name: "Failed Payments",
//     condition: "payment_failures >",
//     threshold: 5,
//     timeWindow: "15m",
//     severity: "high",
//     enabled: true
//   },
//   {
//     name: "API Latency",
//     condition: "avg_response_time >",
//     threshold: 1000,
//     timeWindow: "5m",
//     severity: "medium",
//     enabled: true
//   }
// ] as const;

// export default function LogExplorer() {
//   const { logs } = useLogData();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedLevel, setSelectedLevel] = useState<string>("all");
//   const [selectedService, setSelectedService] = useState<string>("all");
//   const [selectedLog, setSelectedLog] = useState<Log | null>(null);
//   const [timeRange, setTimeRange] = useState<{
//     from: Date;
//     to: Date;
//   }>({
//     from: subHours(new Date(), 24),
//     to: new Date(),
//   });
//   const [activeTab, setActiveTab] = useState("logs");
//   const [selectedMetadataFields, setSelectedMetadataFields] = useState<string[]>([]);
//   const [isLiveTail, setIsLiveTail] = useState(false);
//   const [groupBy, setGroupBy] = useState<string | null>(null);
//   const [savedFilters, setSavedFilters] = useState<Array<{
//     name: string;
//     filters: any;
//   }>>([]);
//   const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
//   const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
//   const [viewMode, setViewMode] = useState<"split" | "full">("split");
//   const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
//   const [selectedView, setSelectedView] = useState<"table" | "json" | "raw">("json");
//   const [aggregationField, setAggregationField] = useState<string | null>(null);
//   const [aggregationTimeWindow, setAggregationTimeWindow] = useState<"1m" | "5m" | "15m" | "1h" | "1d">("15m");
//   const [alertRules, setAlertRules] = useState(EXAMPLE_ALERT_RULES);
//   const [showCorrelatedLogs, setShowCorrelatedLogs] = useState(false);
//   const [selectedTimelineSpan, setSelectedTimelineSpan] = useState<{start: Date; end: Date} | null>(null);
//   const [customFields, setCustomFields] = useState<string[]>([]);
//   const [logPatterns, setLogPatterns] = useState<Array<{
//     pattern: string;
//     count: number;
//     examples: string[];
//   }>>([]);

//   const [logsState, setLogs] = useState<Log[]>(EXAMPLE_LOGS);

//   // Get unique metadata fields from all logs
//   const metadataFields = useMemo(() => {
//     const fields = new Set<string>();
//     logsState.forEach((log) => {
//       Object.keys(log.metadata).forEach((key) => fields.add(key));
//     });
//     return Array.from(fields);
//   }, [logsState]);

//   // Filter logs based on all criteria
//   const filteredLogs = useMemo(() => {
//     return logsState.filter((log) => {
//       const matchesSearch =
//         log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesLevel =
//         selectedLevel === "all" || log.level.toLowerCase() === selectedLevel.toLowerCase();

//       const matchesService =
//         selectedService === "all" ||
//         log.service.toLowerCase() === selectedService.toLowerCase();

//       const timestamp = parseISO(log.timestamp);
//       const matchesTimeRange =
//         timestamp >= timeRange.from && timestamp <= timeRange.to;

//       return matchesSearch && matchesLevel && matchesService && matchesTimeRange;
//     });
//   }, [logsState, searchTerm, selectedLevel, selectedService, timeRange]);

//   // Calculate statistics
//   const statistics = useMemo(() => {
//     const levelStats: LogStats[] = [];
//     const serviceStats: LogStats[] = [];
//     const levelCount: Record<string, number> = {};
//     const serviceCount: Record<string, number> = {};

//     filteredLogs.forEach((log) => {
//       levelCount[log.level] = (levelCount[log.level] || 0) + 1;
//       serviceCount[log.service] = (serviceCount[log.service] || 0) + 1;
//     });

//     Object.entries(levelCount).forEach(([level, count]) => {
//       levelStats.push({ name: level, count });
//     });

//     Object.entries(serviceCount).forEach(([service, count]) => {
//       serviceStats.push({ name: service, count });
//     });

//     return { levelStats, serviceStats };
//   }, [filteredLogs]);

//   // Group logs by specified field
//   const groupedLogs = useMemo(() => {
//     if (!groupBy) return null;

//     return filteredLogs.reduce((acc, log) => {
//       const key = groupBy === "service" ? log.service : 
//                  groupBy === "level" ? log.level :
//                  log.metadata[groupBy] || "undefined";
      
//       if (!acc[key]) {
//         acc[key] = [];
//       }
//       acc[key].push(log);
//       return acc;
//     }, {} as Record<string, typeof filteredLogs>);
//   }, [filteredLogs, groupBy]);

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.ctrlKey || e.metaKey) {
//         switch (e.key) {
//           case "k":
//             e.preventDefault();
//             setShowKeyboardShortcuts(true);
//             break;
//           case "f":
//             e.preventDefault();
//             document.querySelector<HTMLInputElement>('input[placeholder="Search logs..."]')?.focus();
//             break;
//           case "l":
//             e.preventDefault();
//             setIsLiveTail(prev => !prev);
//             break;
//           case "s":
//             e.preventDefault();
//             handleSaveCurrentFilter();
//             break;
//         }
//       }
//     };

//     window.addEventListener("keydown", handleKeyPress);
//     return () => window.removeEventListener("keydown", handleKeyPress);
//   }, []);

//   // Live tail functionality
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isLiveTail) {
//       interval = setInterval(() => {
//         // Simulate new logs in development
//         const newLog = {
//           service: "live_tail_service",
//           level: ["info", "warn", "error"][Math.floor(Math.random() * 3)],
//           message: "New live log entry " + new Date().toISOString(),
//           metadata: {
//             timestamp: new Date().toISOString(),
//             random_value: Math.random(),
//           },
//           timestamp: new Date().toISOString(),
//         };
//         setLogs(prev => [newLog, ...prev].slice(0, 1000)); // Keep last 1000 logs
//       }, 2000);
//     }
//     return () => clearInterval(interval);
//   }, [isLiveTail]);

//   const getLevelColor = (level: string) => {
//     switch (level.toLowerCase()) {
//       case "error":
//         return "text-red-500";
//       case "warn":
//         return "text-yellow-500";
//       case "info":
//         return "text-blue-500";
//       default:
//         return "text-gray-500";
//     }
//   };

//   const getLevelIcon = (level: string) => {
//     switch (level.toLowerCase()) {
//       case "error":
//         return <AlertCircle className="w-4 h-4 text-red-500" />;
//       case "warn":
//         return <AlertCircle className="w-4 h-4 text-yellow-500" />;
//       case "info":
//         return <Info className="w-4 h-4 text-blue-500" />;
//       default:
//         return <Info className="w-4 h-4 text-gray-500" />;
//     }
//   };

//   const exportLogs = () => {
//     const exportData = filteredLogs.map((log) => ({
//       ...log,
//       metadata: JSON.stringify(log.metadata),
//     }));
//     const csvContent =
//       "data:text/csv;charset=utf-8," +
//       [
//         ["Timestamp", "Service", "Level", "Message", "Metadata"].join(","),
//         ...exportData.map((log) =>
//           [
//             log.timestamp,
//             log.service,
//             log.level,
//             `"${log.message.replace(/"/g, '""')}"`,
//             `"${log.metadata.replace(/"/g, '""')}"`,
//           ].join(",")
//         ),
//       ].join("\n");

//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute(
//       "download",
//       `logs_export_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleSaveCurrentFilter = () => {
//     const filterName = prompt("Enter a name for this filter:");
//     if (filterName) {
//       setSavedFilters(prev => [...prev, {
//         name: filterName,
//         filters: {
//           searchTerm,
//           selectedLevel,
//           selectedService,
//           timeRange,
//           selectedMetadataFields,
//         }
//       }]);
//       toast.success("Filter saved successfully!");
//     }
//   };

//   const applyFilter = (filter: any) => {
//     setSearchTerm(filter.filters.searchTerm);
//     setSelectedLevel(filter.filters.selectedLevel);
//     setSelectedService(filter.filters.selectedService);
//     setTimeRange(filter.filters.timeRange);
//     setSelectedMetadataFields(filter.filters.selectedMetadataFields);
//     toast.success("Filter applied successfully!");
//   };

//   const shareSelectedLogs = () => {
//     const selectedLogs = filteredLogs.filter((_, index) => selectedLogIds.includes(index.toString()));
//     const shareUrl = `${window.location.origin}/share?logs=${encodeURIComponent(JSON.stringify(selectedLogs))}`;
//     navigator.clipboard.writeText(shareUrl);
//     toast.success("Share URL copied to clipboard!");
//   };

//   // Enhanced log pattern detection
//   const detectLogPatterns = useCallback(() => {
//     const patterns: Record<string, { count: number; examples: string[] }> = {};
//     filteredLogs.forEach(log => {
//       const tokenizedMessage = log.message.replace(/[0-9]+/g, "N").replace(/[a-f0-9]{32}/g, "HASH");
//       if (!patterns[tokenizedMessage]) {
//         patterns[tokenizedMessage] = { count: 0, examples: [] };
//       }
//       patterns[tokenizedMessage].count++;
//       if (patterns[tokenizedMessage].examples.length < 3) {
//         patterns[tokenizedMessage].examples.push(log.message);
//       }
//     });
    
//     setLogPatterns(Object.entries(patterns)
//       .map(([pattern, data]) => ({ pattern, ...data }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 10));
//   }, [filteredLogs]);

//   // Correlation analysis
//   const findCorrelatedLogs = useCallback((log: Log) => {
//     if (!log.traceId && !log.correlationId) return [];
    
//     return filteredLogs.filter(l => 
//       (log.traceId && l.traceId === log.traceId) || 
//       (log.correlationId && l.correlationId === log.correlationId)
//     );
//   }, [filteredLogs]);

//   const renderLogContent = (log: Log) => {
//     switch (selectedView) {
//       case "json":
//         return (
//           <div className="font-mono text-sm">
//             <JsonView data={log} />
//           </div>
//         );
//       case "table":
//         return (
//           <div className="space-y-2">
//             <table className="min-w-full">
//               <tbody>
//                 <tr>
//                   <td className="font-medium pr-4">Timestamp</td>
//                   <td>{format(parseISO(log.timestamp), "yyyy-MM-dd HH:mm:ss.SSS")}</td>
//                 </tr>
//                 <tr>
//                   <td className="font-medium pr-4">Service</td>
//                   <td>{log.service}</td>
//                 </tr>
//                 <tr>
//                   <td className="font-medium pr-4">Level</td>
//                   <td className={getLevelColor(log.level)}>{log.level.toUpperCase()}</td>
//                 </tr>
//                 <tr>
//                   <td className="font-medium pr-4">Message</td>
//                   <td>{log.message}</td>
//                 </tr>
//                 <tr>
//                   <td className="font-medium pr-4">Trace ID</td>
//                   <td>{log.traceId}</td>
//                 </tr>
//                 <tr>
//                   <td className="font-medium pr-4">Span ID</td>
//                   <td>{log.spanId}</td>
//                 </tr>
//                 <tr>
//                   <td className="font-medium pr-4">Environment</td>
//                   <td>{log.environment}</td>
//                 </tr>
//                 <tr>
//                   <td className="font-medium pr-4">Tags</td>
//                   <td>
//                     <div className="flex gap-1">
//                       {log.tags?.map((tag, i) => (
//                         <Badge key={i} variant="secondary">{tag}</Badge>
//                       ))}
//                     </div>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         );
//       case "raw":
//         return (
//           <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">
//             {JSON.stringify(log, null, 2)}
//           </pre>
//         );
//     }
//   };

//   const renderAnalyticsContent = () => {
//     const logsByLevel = logsState.reduce((acc, log) => {
//       acc[log.level] = (acc[log.level] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     const logsByService = logsState.reduce((acc, log) => {
//       acc[log.service] = (acc[log.service] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     const timeSeriesData = logsState.map(log => ({
//       time: parseISO(log.timestamp),
//       level: log.level,
//       service: log.service
//     })).sort((a, b) => a.time.getTime() - b.time.getTime());

//     return (
//       <div className="grid grid-cols-2 gap-4">
//         <Card className="p-4">
//           <h3 className="text-lg font-semibold mb-4">Log Levels Distribution</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={Object.entries(logsByLevel).map(([name, value]) => ({ name, value }))}
//                 dataKey="value"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={80}
//                 label
//               >
//                 {Object.entries(logsByLevel).map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={
//                     entry[0] === "error" ? "#ef4444" :
//                     entry[0] === "warn" ? "#f59e0b" :
//                     "#3b82f6"
//                   } />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </Card>

//         <Card className="p-4">
//           <h3 className="text-lg font-semibold mb-4">Service Activity</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={Object.entries(logsByService).map(([name, value]) => ({ name, value }))}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="value" fill="#3b82f6" />
//             </BarChart>
//           </ResponsiveContainer>
//         </Card>

//         <Card className="col-span-2 p-4">
//           <h3 className="text-lg font-semibold mb-4">Log Timeline</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <RechartsLineChart data={timeSeriesData.map(d => ({
//               time: format(d.time, "HH:mm:ss"),
//               level: d.level,
//               service: d.service
//             }))}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               <YAxis />
//               <Tooltip />
//               <Line type="monotone" dataKey="level" stroke="#3b82f6" />
//             </RechartsLineChart>
//           </ResponsiveContainer>
//         </Card>
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col h-screen gap-4 p-4">
//       {/* Enhanced Header */}
//       <div className="flex items-center justify-between gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0">
//         <div className="flex items-center gap-2 flex-1">
//           <div className="relative flex-1">
//             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search logs..."
//               className="pl-8"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <Select value={selectedLevel} onValueChange={setSelectedLevel}>
//             <SelectTrigger className="w-[120px]">
//               <SelectValue placeholder="Level" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Levels</SelectItem>
//               <SelectItem value="error">Error</SelectItem>
//               <SelectItem value="warn">Warning</SelectItem>
//               <SelectItem value="info">Info</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={selectedService} onValueChange={setSelectedService}>
//             <SelectTrigger className="w-[150px]">
//               <SelectValue placeholder="Service" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Services</SelectItem>
//               <SelectItem value="user_service">User Service</SelectItem>
//             </SelectContent>
//           </Select>
//           <DatePickerWithRange
//             date={{
//               from: timeRange.from,
//               to: timeRange.to,
//             }}
//             onSelect={(range) => {
//               if (range?.from && range?.to) {
//                 setTimeRange({ from: range.from, to: range.to });
//               }
//             }}
//           />
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 Group By <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuItem onClick={() => setGroupBy(null)}>
//                 No Grouping
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setGroupBy("service")}>
//                 Service
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setGroupBy("level")}>
//                 Log Level
//               </DropdownMenuItem>
//               {metadataFields.map(field => (
//                 <DropdownMenuItem key={field} onClick={() => setGroupBy(field)}>
//                   {field}
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//         <div className="flex items-center gap-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <Filter className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-[200px]">
//               {metadataFields.map((field) => (
//                 <DropdownMenuItem
//                   key={field}
//                   onClick={() => {
//                     setSelectedMetadataFields((prev) =>
//                       prev.includes(field)
//                         ? prev.filter((f) => f !== field)
//                         : [...prev, field]
//                     );
//                   }}
//                 >
//                   {field}
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <Button
//             variant={isLiveTail ? "default" : "outline"}
//             size="icon"
//             onClick={() => setIsLiveTail(!isLiveTail)}
//             title="Live Tail (Ctrl+L)"
//           >
//             {isLiveTail ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
//           </Button>
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => setViewMode(prev => prev === "split" ? "full" : "split")}
//           >
//             {viewMode === "split" ? (
//               <Maximize2 className="h-4 w-4" />
//             ) : (
//               <SplitSquareVertical className="h-4 w-4" />
//             )}
//           </Button>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <BarChart2 className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuLabel>Chart Type</DropdownMenuLabel>
//               <DropdownMenuItem onClick={() => setChartType("bar")}>
//                 Bar Chart
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setChartType("line")}>
//                 Line Chart
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setChartType("pie")}>
//                 Pie Chart
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => setShowKeyboardShortcuts(true)}
//           >
//             <Keyboard className="h-4 w-4" />
//           </Button>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 More <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuGroup>
//                 <DropdownMenuItem onClick={handleSaveCurrentFilter}>
//                   <BookmarkPlus className="mr-2 h-4 w-4" />
//                   Save Current Filter
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={shareSelectedLogs}>
//                   <Share2 className="mr-2 h-4 w-4" />
//                   Share Selected Logs
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={exportLogs}>
//                   <Download className="mr-2 h-4 w-4" />
//                   Export Logs
//                 </DropdownMenuItem>
//               </DropdownMenuGroup>
//               <DropdownMenuSeparator />
//               <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
//               {savedFilters.map((filter, index) => (
//                 <DropdownMenuItem key={index} onClick={() => applyFilter(filter)}>
//                   {filter.name}
//                   <Trash2
//                     className="ml-2 h-4 w-4 text-destructive"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setSavedFilters(prev => prev.filter((_, i) => i !== index));
//                     }}
//                   />
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Enhanced Header */}
//       <div className="flex items-center justify-between gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0">
//         <div className="flex items-center gap-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 View <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuItem onClick={() => setSelectedView("json")}>
//                 <Code className="mr-2 h-4 w-4" /> JSON View
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setSelectedView("table")}>
//                 <Table2 className="mr-2 h-4 w-4" /> Table View
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setSelectedView("raw")}>
//                 <Terminal className="mr-2 h-4 w-4" /> Raw View
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 Analysis <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuItem onClick={detectLogPatterns}>
//                 <Workflow className="mr-2 h-4 w-4" /> Detect Patterns
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setShowCorrelatedLogs(true)}>
//                 <GitBranch className="mr-2 h-4 w-4" /> Show Correlations
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuLabel>Aggregation</DropdownMenuLabel>
//               <DropdownMenuItem onClick={() => setAggregationField("level")}>
//                 By Level
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setAggregationField("service")}>
//                 By Service
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setAggregationField("environment")}>
//                 By Environment
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 Tools <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuItem>
//                 <Shield className="mr-2 h-4 w-4" /> Security Analysis
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <Bug className="mr-2 h-4 w-4" /> Error Analysis
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <Cpu className="mr-2 h-4 w-4" /> Performance Insights
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <Network className="mr-2 h-4 w-4" /> Network Analysis
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <Database className="mr-2 h-4 w-4" /> Database Operations
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Main content with enhanced features */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="logs">
//             <Terminal className="mr-2 h-4 w-4" /> Logs
//           </TabsTrigger>
//           <TabsTrigger value="analytics">
//             <BarChart2 className="mr-2 h-4 w-4" /> Analytics
//           </TabsTrigger>
//           <TabsTrigger value="patterns">
//             <Workflow className="mr-2 h-4 w-4" /> Patterns
//           </TabsTrigger>
//           <TabsTrigger value="alerts">
//             <AlertOctagon className="mr-2 h-4 w-4" /> Alerts
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="logs" className="flex gap-4 mt-0 flex-1">
//           {/* Left Panel - Log List */}
//           <div className="flex flex-col w-1/2">
//             <ScrollArea className="flex-1 rounded-md border">
//               <div className="space-y-2 p-4">
//                 {filteredLogs.map((log, index) => (
//                   <Card
//                     key={index}
//                     className={`p-4 cursor-pointer hover:bg-accent ${
//                       selectedLog === log ? "border-primary" : ""
//                     }`}
//                     onClick={() => setSelectedLog(log)}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         {getLevelIcon(log.level)}
//                         <span className={`font-medium ${getLevelColor(log.level)}`}>
//                           {log.level.toUpperCase()}
//                         </span>
//                         <span className="text-sm text-muted-foreground">
//                           {log.service}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                         <Clock className="h-4 w-4" />
//                         {format(parseISO(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
//                       </div>
//                     </div>
//                     <p className="mt-2 text-sm">{log.message}</p>
//                     {selectedMetadataFields.length > 0 && (
//                       <div className="mt-2 text-sm text-muted-foreground">
//                         {selectedMetadataFields.map((field) => (
//                           <div key={field} className="flex gap-2">
//                             <span className="font-medium">{field}:</span>
//                             <span>{JSON.stringify(log.metadata[field])}</span>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </Card>
//                 ))}
//               </div>
//             </ScrollArea>
//           </div>

//           {/* Right Panel - Log Details */}
//           <Card className="w-1/2 p-4">
//             {selectedLog ? (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-semibold">Log Details</h3>
//                   <span className="text-sm text-muted-foreground">
//                     {format(parseISO(selectedLog.timestamp), "MMM dd, yyyy HH:mm:ss")}
//                   </span>
//                 </div>
//                 <div className="space-y-2">
//                   {renderLogContent(selectedLog)}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex h-full items-center justify-center text-muted-foreground">
//                 Select a log to view details
//               </div>
//             )}
//           </Card>
//         </TabsContent>

//         <TabsContent value="analytics" className="mt-0">
//           {renderAnalyticsContent()}
//         </TabsContent>

//         <TabsContent value="patterns" className="mt-0">
//           <Card className="p-4">
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold">Log Patterns</h3>
//                 <Button onClick={detectLogPatterns}>
//                   <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Patterns
//                 </Button>
//               </div>
//               <div className="space-y-4">
//                 {logPatterns.map((pattern, index) => (
//                   <Card key={index} className="p-4">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <Hash className="h-4 w-4" />
//                         <span className="font-medium">Pattern {index + 1}</span>
//                       </div>
//                       <Badge>{pattern.count} occurrences</Badge>
//                     </div>
//                     <p className="mt-2 text-sm font-mono">{pattern.pattern}</p>
//                     <div className="mt-2">
//                       <span className="text-sm text-muted-foreground">Examples:</span>
//                       <ul className="mt-1 space-y-1">
//                         {pattern.examples.map((example, i) => (
//                           <li key={i} className="text-sm">{example}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             </div>
//           </Card>
//         </TabsContent>

//         <TabsContent value="alerts" className="mt-0">
//           <Card className="p-4">
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold">Alert Rules</h3>
//                 <Button onClick={() => {
//                   // Add new alert rule
//                 }}>
//                   <Plus className="mr-2 h-4 w-4" /> Add Rule
//                 </Button>
//               </div>
//               <div className="space-y-4">
//                 {alertRules.map((rule, index) => (
//                   <Card key={index} className="p-4">
//                     <div className="flex items-center justify-between">
//                       <div className="space-y-1">
//                         <h4 className="font-medium">{rule.name}</h4>
//                         <p className="text-sm text-muted-foreground">
//                           {rule.condition} {rule.threshold} in {rule.timeWindow}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Badge variant={
//                           rule.severity === "high" ? "destructive" :
//                           rule.severity === "medium" ? "warning" : "default"
//                         }>
//                           {rule.severity}
//                         </Badge>
//                         <Switch
//                           checked={rule.enabled}
//                           onCheckedChange={(checked) => {
//                             const newRules = [...alertRules];
//                             newRules[index].enabled = checked;
//                             setAlertRules(newRules);
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             </div>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Keyboard Shortcuts Dialog */}
//       <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Keyboard Shortcuts</DialogTitle>
//             <DialogDescription>
//               Use these shortcuts to quickly navigate and control the log explorer
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="flex justify-between">
//               <span>Search</span>
//               <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘ + F</kbd>
//             </div>
//             <div className="flex justify-between">
//               <span>Live Tail</span>
//               <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘ + L</kbd>
//             </div>
//             <div className="flex justify-between">
//               <span>Save Filter</span>
//               <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘ + S</kbd>
//             </div>
//             <div className="flex justify-between">
//               <span>Show Shortcuts</span>
//               <kbd className="px-2 py-1 bg-muted rounded">Ctrl/⌘ + K</kbd>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }