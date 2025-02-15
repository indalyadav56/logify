import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Calendar,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DateTimePicker from "@/components/DateRangePicker";
import LogSection from "./LogSection";
import { useLogStore } from "@/store/useLogStore";
import { ScrollArea } from "@/components/ui/scroll-area";

const levelOptions = ["ERROR", "WARNING", "INFO", "DEBUG"];
const serviceOptions = ["auth-service", "user-service", "payment-service"];
const commonMetadataFields = [
  { label: "User IP", value: "user_ip" },
  { label: "Request ID", value: "request_id" },
  { label: "User ID", value: "user_id" },
  { label: "Session ID", value: "session_id" },
  { label: "Environment", value: "environment" },
  { label: "Host", value: "host" },
  { label: "Status Code", value: "status_code" },
  { label: "Method", value: "method" },
  { label: "Path", value: "path" },
  { label: "Client", value: "client" },
  { label: "Version", value: "version" },
];

export default function LogExplorer() {
  const {
    logs,
    filters,
    isLoading,
    error,
    setFilter,
    addSearchMessage,
    removeSearchMessage,
    addMetadata,
    removeMetadata,
    fetchLogs,
    clearFilters,
  } = useLogStore();

  const [currentMetadataKey, setCurrentMetadataKey] = useState<string>("");
  const [currentMetadataValue, setCurrentMetadataValue] = useState<string>("");
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [
    fetchLogs,
    filters.searchMessages,
    filters.selectedLevels,
    filters.selectedService,
    filters.timeRange,
    filters.isCustomRange,
    filters.customDateRange,
    filters.metadata,
    filters.sortOrder,
    filters.page,
    filters.limit,
  ]);

  const handleAddSearchMessage = () => {
    if (currentMessage.trim()) {
      addSearchMessage(currentMessage.trim());
      setCurrentMessage("");
    }
  };

  const handleAddMetadata = () => {
    if (currentMetadataKey && currentMetadataValue) {
      addMetadata(currentMetadataKey, currentMetadataValue);
      setCurrentMetadataKey("");
      setCurrentMetadataValue("");
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    // Implementation for export functionality
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Log Explorer</h1>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSearchMessage();
                }}
                className="pl-10"
              />
            </div>
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {(filters.selectedLevels.length > 0 ||
                    Object.keys(filters.metadata).length > 0 ||
                    filters.selectedService !== "all") && (
                    <Badge variant="secondary">
                      {filters.selectedLevels.length +
                        Object.keys(filters.metadata).length +
                        (filters.selectedService !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Logs</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Time Range */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Time Range</h3>
                    <Tabs
                      value={filters.isCustomRange ? "custom" : filters.timeRange}
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setFilter("isCustomRange", true);
                        } else {
                          setFilter("isCustomRange", false);
                          setFilter("timeRange", value);
                        }
                      }}
                    >
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="15m">15m</TabsTrigger>
                        <TabsTrigger value="1h">1h</TabsTrigger>
                        <TabsTrigger value="24h">24h</TabsTrigger>
                        <TabsTrigger value="custom">
                          <Calendar className="h-4 w-4" />
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="custom" className="mt-3">
                        <DateTimePicker
                          date={filters.customDateRange}
                          setDate={(range) => setFilter("customDateRange", range)}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Log Levels */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Log Level</h3>
                    <div className="flex flex-wrap gap-2">
                      {levelOptions.map((level) => (
                        <Badge
                          key={level}
                          variant={
                            filters.selectedLevels.includes(level)
                              ? "default"
                              : "outline"
                          }
                          className={`cursor-pointer ${
                            filters.selectedLevels.includes(level)
                              ? level === "ERROR"
                                ? "bg-red-500 hover:bg-red-600"
                                : level === "WARNING"
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : level === "INFO"
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-gray-500 hover:bg-gray-600"
                              : ""
                          }`}
                          onClick={() => {
                            const newLevels = filters.selectedLevels.includes(level)
                              ? filters.selectedLevels.filter((l) => l !== level)
                              : [...filters.selectedLevels, level];
                            setFilter("selectedLevels", newLevels);
                          }}
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Service</h3>
                    <Select
                      value={filters.selectedService}
                      onValueChange={(value) => setFilter("selectedService", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {serviceOptions.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Metadata</h3>
                    <div className="space-y-3">
                      <Select
                        value={currentMetadataKey}
                        onValueChange={setCurrentMetadataKey}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonMetadataFields.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Value"
                          value={currentMetadataValue}
                          onChange={(e) => setCurrentMetadataValue(e.target.value)}
                        />
                        <Button onClick={handleAddMetadata}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(filters.metadata).map(([key, value]) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {key}: {value}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeMetadata(key)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      clearFilters();
                      setIsFiltersOpen(false);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")
              }
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Active Search Terms */}
          {filters.searchMessages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.searchMessages.map((message, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {message}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSearchMessage(message)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Logs Section */}
        <div className="relative min-h-[500px] bg-card rounded-lg border">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)] w-full">
              <div className="p-4 w-full max-w-full">
                <LogSection logs={logs} />
              </div>
            </ScrollArea>
          )}
        </div>
      </main>
    </div>
  );
}