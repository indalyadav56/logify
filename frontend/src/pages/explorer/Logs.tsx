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
  Settings2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const levelOptions = ["ERROR", "WARNING", "INFO", "DEBUG"];
const serviceOptions = ["auth-service", "user-service", "payment-service"];

export default function LogExplorer() {
  const { logs, fetchLogs } = useLogStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 gap-4">
          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-lg font-semibold">Log Explorer</h1>
            <Badge variant="outline" className="text-xs">
              {logs.length} entries
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="icon" size="sm">
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="border-t px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <DateTimePicker />
          </div>

          {/* Active Filters */}
          {(selectedLevels.length > 0 || selectedServices.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedLevels.map((level) => (
                <Badge
                  key={level}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {level}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setSelectedLevels(selectedLevels.filter((l) => l !== level))
                    }
                  />
                </Badge>
              ))}
              {selectedServices.map((service) => (
                <Badge
                  key={service}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {service}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setSelectedServices(
                        selectedServices.filter((s) => s !== service)
                      )
                    }
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <LogSection logs={logs} />
      </div>

      {/* Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-[400px]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Log Level</h3>
              <div className="flex flex-wrap gap-2">
                {levelOptions.map((level) => (
                  <Button
                    key={level}
                    variant={
                      selectedLevels.includes(level) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setSelectedLevels(
                        selectedLevels.includes(level)
                          ? selectedLevels.filter((l) => l !== level)
                          : [...selectedLevels, level]
                      )
                    }
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Service</h3>
              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((service) => (
                  <Button
                    key={service}
                    variant={
                      selectedServices.includes(service) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setSelectedServices(
                        selectedServices.includes(service)
                          ? selectedServices.filter((s) => s !== service)
                          : [...selectedServices, service]
                      )
                    }
                  >
                    {service}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
