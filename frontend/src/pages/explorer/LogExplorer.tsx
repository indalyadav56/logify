import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useLogData } from "@/hooks/useLogData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { addHours, format, parseISO, subHours } from "date-fns";

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

  return (
    <div className="flex flex-col h-screen gap-4 p-4">
      {/* Header with controls */}
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
          <Button variant="outline" size="icon" onClick={exportLogs}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
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
            {/* Log Levels Chart */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Log Levels Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statistics.levelStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
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
    </div>
  );
}