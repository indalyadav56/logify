import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Search, X, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLogStore } from "@/store/useLogStore";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import LogSection from "./LogSection";

const levelOptions = ["ERROR", "WARNING", "INFO", "DEBUG", "TRACE"];
const serviceOptions = [
  { value: "all", label: "All Services" },
  { value: "auth-service", label: "Auth Service" },
  { value: "payment-service", label: "Payment Service" },
  { value: "user-service", label: "User Service" },
];
const timeRangeOptions = [
  { value: "15m", label: "Last 15 minutes" },
  { value: "30m", label: "Last 30 minutes" },
  { value: "1h", label: "Last 1 hour" },
  { value: "3h", label: "Last 3 hours" },
  { value: "6h", label: "Last 6 hours" },
  { value: "12h", label: "Last 12 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "custom", label: "Custom Range" },
];

const getLevelIcon = (level: string) => {
  switch (level) {
    case "ERROR":
      return "🔴";
    case "WARNING":
      return "⚠️";
    case "INFO":
      return "ℹ️";
    case "DEBUG":
      return "🔍";
    case "TRACE":
      return "👣";
    default:
      return "•";
  }
};

export default function LogExplorer() {
  const { filters, logs, fetchLogs, setFilter, addSearchMessage, removeSearchMessage, addMetadata, removeMetadata, clearFilters } = useLogStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState("all");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [newMetadataKey, setNewMetadataKey] = useState("");
  const [newMetadataValue, setNewMetadataValue] = useState("");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState("15m");
  const [isCustomRange, setIsCustomRange] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setFilter("page", 1);
    setFilter("selectedService", selectedService);
    await fetchLogs();
    setIsRefreshing(false);
    window.scrollTo(0, 0);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const newTerm = searchQuery.trim();
      if (!filters.searchMessages.includes(newTerm)) {
        addSearchMessage(newTerm);
        setFilter("page", 1);
        fetchLogs();
      }
      setSearchQuery("");
    }
  };

  const handleRemoveSearchTerm = (term: string) => {
    removeSearchMessage(term);
    setFilter("page", 1);
    fetchLogs();
  };

  const handleClearAllFilters = () => {
    setSelectedLevels([]);
    setCustomDateRange({ from: undefined, to: undefined });
    setSelectedTimeRange("15m");
    setIsCustomRange(false);
    setSelectedService("all");
    clearFilters();
    fetchLogs();
  };

  const handleAddMetadata = () => {
    if (newMetadataKey.trim() && newMetadataValue.trim()) {
      addMetadata(newMetadataKey.trim(), newMetadataValue.trim());
      setNewMetadataKey("");
      setNewMetadataValue("");
      setFilter("page", 1);
      fetchLogs();
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
    setIsCustomRange(value === "custom");
    if (value !== "custom") {
      setFilter("timeRange", value);
      setFilter("isCustomRange", false);
      setFilter("page", 1);
      fetchLogs();
    }
  };

  const handleCustomDateChange = (field: "from" | "to", date: Date | undefined) => {
    setCustomDateRange(prev => ({ ...prev, [field]: date }));
    if (field === "to" && customDateRange.from && date) {
      setFilter("customDateRange", {
        from: customDateRange.from,
        to: date,
      });
      setFilter("isCustomRange", true);
      setFilter("page", 1);
      fetchLogs();
    }
  };

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    setFilter("selectedService", value);
    setFilter("page", 1);
    fetchLogs();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters Section */}
      <div className="flex-none p-4 space-y-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Log Explorer</h2>
          <div className="flex items-center gap-2">
            <Sheet open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Add Filters
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px]">
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                  <SheetDescription>
                    Configure advanced filtering options for your logs
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  {/* Service Filter Section */}
                  <div className="space-y-4">
                    <Label>Service</Label>
                    <Select value={selectedService} onValueChange={handleServiceChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {serviceOptions.map(service => (
                            <SelectItem key={service.value} value={service.value}>
                              {service.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Level Filters Section */}
                  <div className="space-y-4">
                    <Label>Log Levels</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={selectedLevels.includes("ERROR") ? "default" : "outline"}
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          const newLevels = selectedLevels.includes("ERROR")
                            ? selectedLevels.filter(l => l !== "ERROR")
                            : [...selectedLevels, "ERROR"];
                          setSelectedLevels(newLevels);
                          setFilter("selectedLevels", newLevels);
                          setFilter("page", 1);
                          fetchLogs();
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-red-500">⬤</span> ERROR
                        </div>
                      </Badge>

                      <Badge
                        variant={selectedLevels.includes("WARNING") ? "default" : "outline"}
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          const newLevels = selectedLevels.includes("WARNING")
                            ? selectedLevels.filter(l => l !== "WARNING")
                            : [...selectedLevels, "WARNING"];
                          setSelectedLevels(newLevels);
                          setFilter("selectedLevels", newLevels);
                          setFilter("page", 1);
                          fetchLogs();
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⚠</span> WARNING
                        </div>
                      </Badge>

                      <Badge
                        variant={selectedLevels.includes("INFO") ? "default" : "outline"}
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          const newLevels = selectedLevels.includes("INFO")
                            ? selectedLevels.filter(l => l !== "INFO")
                            : [...selectedLevels, "INFO"];
                          setSelectedLevels(newLevels);
                          setFilter("selectedLevels", newLevels);
                          setFilter("page", 1);
                          fetchLogs();
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-blue-500">ℹ</span> INFO
                        </div>
                      </Badge>

                      <Badge
                        variant={selectedLevels.includes("DEBUG") ? "default" : "outline"}
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          const newLevels = selectedLevels.includes("DEBUG")
                            ? selectedLevels.filter(l => l !== "DEBUG")
                            : [...selectedLevels, "DEBUG"];
                          setSelectedLevels(newLevels);
                          setFilter("selectedLevels", newLevels);
                          setFilter("page", 1);
                          fetchLogs();
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">🔍</span> DEBUG
                        </div>
                      </Badge>

                      <Badge
                        variant={selectedLevels.includes("TRACE") ? "default" : "outline"}
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          const newLevels = selectedLevels.includes("TRACE")
                            ? selectedLevels.filter(l => l !== "TRACE")
                            : [...selectedLevels, "TRACE"];
                          setSelectedLevels(newLevels);
                          setFilter("selectedLevels", newLevels);
                          setFilter("page", 1);
                          fetchLogs();
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">👣</span> TRACE
                        </div>
                      </Badge>
                    </div>
                  </div>

                  {/* Time Range Section */}
                  <div className="space-y-4">
                    <Label>Time Range</Label>
                    <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeRangeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isCustomRange && (
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label>From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !customDateRange.from && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {customDateRange.from ? format(customDateRange.from, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={customDateRange.from}
                                onSelect={(date) => handleCustomDateChange("from", date)}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid gap-2">
                          <Label>To</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !customDateRange.to && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {customDateRange.to ? format(customDateRange.to, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={customDateRange.to}
                                onSelect={(date) => handleCustomDateChange("to", date)}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata Section */}
                  <div className="space-y-4">
                    <Label>Metadata Filters</Label>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Key"
                          value={newMetadataKey}
                          onChange={(e) => setNewMetadataKey(e.target.value)}
                        />
                        <Input
                          placeholder="Value"
                          value={newMetadataValue}
                          onChange={(e) => setNewMetadataValue(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddMetadata} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Metadata Filter
                      </Button>
                    </div>

                    {/* Metadata Tags */}
                    {Object.entries(filters.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(filters.metadata).map(([key, value]) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1"
                          >
                            <span className="text-sm">
                              {key}: {value}
                            </span>
                            <button
                              onClick={() => {
                                removeMetadata(key);
                                setFilter("page", 1);
                                fetchLogs();
                              }}
                              className="ml-1 hover:text-destructive focus:outline-none"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <SheetFooter>
                  <Button variant="outline" onClick={() => setIsAdvancedFiltersOpen(false)}>
                    Done
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear All Filters
            </Button>
          </div>
        </div>

        {/* Search and Filters Row */}
        <div className="flex flex-col gap-4">
          {/* Search Bar and Refresh */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search logs... (Press Enter to add)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Active Filters Summary */}
          {(filters.searchMessages.length > 0 ||
            Object.keys(filters.metadata).length > 0 ||
            selectedLevels.length > 0 ||
            selectedService !== "all" ||
            selectedTimeRange !== "15m" ||
            isCustomRange) ? (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Active Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="h-7 text-muted-foreground hover:text-destructive"
                >
                  Clear All
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Time Range Filter */}
                {(selectedTimeRange !== "15m" || (isCustomRange && customDateRange.from && customDateRange.to)) && (
                  <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span className="text-sm">
                      {isCustomRange
                        ? `${format(customDateRange.from!, "PP")} - ${format(customDateRange.to!, "PP")}`
                        : timeRangeOptions.find(opt => opt.value === selectedTimeRange)?.label}
                    </span>
                  </Badge>
                )}

                {/* Service Filter */}
                {selectedService !== "all" && (
                  <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                    <span className="text-sm">
                      Service: {serviceOptions.find(s => s.value === selectedService)?.label}
                    </span>
                  </Badge>
                )}

                {/* Metadata Filters */}
                {Object.entries(filters.metadata).map(([key, value]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span className="text-sm">
                      {key}: {value}
                    </span>
                    <button
                      onClick={() => {
                        removeMetadata(key);
                        setFilter("page", 1);
                        fetchLogs();
                      }}
                      className="ml-1 hover:text-destructive focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}

                {/* Search Terms */}
                {filters.searchMessages.map((term) => (
                  <Badge 
                    key={term}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <Search className="h-3 w-3 mr-1" />
                    <span className="text-sm">{term}</span>
                    <button
                      onClick={() => handleRemoveSearchTerm(term)}
                      className="ml-1 hover:text-destructive focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}

                {/* Level Filters */}
                {selectedLevels.map((level) => (
                  <Badge
                    key={level}
                    variant="default"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span className="text-sm">
                      {getLevelIcon(level)} {level}
                    </span>
                    <button
                      onClick={() => {
                        const newLevels = selectedLevels.filter(l => l !== level);
                        setSelectedLevels(newLevels);
                        setFilter("selectedLevels", newLevels);
                        setFilter("page", 1);
                        fetchLogs();
                      }}
                      className="ml-1 hover:text-destructive focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <LogSection
          logs={logs}
          selectedProject={selectedProject}
          isRefreshing={isRefreshing}
        />
      </main>
    </div>
  );
}
