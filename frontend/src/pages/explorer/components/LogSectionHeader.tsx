import { Search } from "lucide-react";
import {
  Filter,
  Save,
  Columns,
  BarChart2,
  Settings,
  RefreshCw,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLogStore } from "@/store/useLogStore";

type Theme = "light" | "dark" | "system";

export default function LogSectionHeader() {
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [fontSize, setFontSize] = useState(14);
  const [compactMode, setCompactMode] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [quickFilter, setQuickFilter] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(["level", "message", "timestamp", "service"])
  );
  const [savedViews, setSavedViews] = useState<
    Array<{ id: string; name: string; filters: any }>
  >([]);

  const { fetchLogs } = useLogStore();

  // Auto-refresh functionality
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (autoRefresh) {
      intervalId = setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchLogs();
      setLastRefresh(new Date());
      toast.success("Logs refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh logs");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Save preferences
  const savePreferences = () => {
    const prefs = {
      theme,
      fontSize,
      compactMode,
      showLineNumbers,
      visibleColumns: Array.from(visibleColumns),
    };
    localStorage.setItem("logifyPreferences", JSON.stringify(prefs));
    toast.success("Preferences saved successfully");
  };

  // Save current view
  const saveCurrentView = () => {
    const newView = {
      id: Date.now().toString(),
      name: `View ${savedViews.length + 1}`,
      filters: {
        quickFilter,
      },
    };
    setSavedViews((prev) => [...prev, newView]);
    toast.success("View saved successfully");
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap py-4 px-4">
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          {/* <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /> */}
          {/* <Input
            placeholder="Quick filter logs..."
            className="pl-8"
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
          /> */}
        </div>

       
        {/* 
        <Button
          variant="outline"
          size="icon"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={autoRefresh ? "bg-primary/10" : ""}
        >
          <Clock className="h-4 w-4" />
        </Button> */}

        
      </div>

      <div className="flex items-center gap-2">
      <div className="text-sm text-muted-foreground">
          Last refreshed:{" "}
          {formatDistanceToNow(lastRefresh, { addSuffix: true })}
          {autoRefresh && ` • Auto-refresh every ${refreshInterval}s`}
        </div>
      <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={isRefreshing ? "animate-spin" : ""}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Save className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={saveCurrentView}>
              Save Current View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {savedViews.map((view) => (
              <DropdownMenuItem key={view.id}>{view.name}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Log Viewer Settings</SheetTitle>
              <SheetDescription>
                Customize your log viewing experience
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={theme}
                  onValueChange={(value: Theme) => setTheme(value)}
                >
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  min={12}
                  max={20}
                  step={1}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Compact Mode</Label>
                <Switch
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Line Numbers</Label>
                <Switch
                  checked={showLineNumbers}
                  onCheckedChange={setShowLineNumbers}
                />
              </div>
              <div className="space-y-2">
                <Label>Auto-refresh Interval (seconds)</Label>
                <Slider
                  value={[refreshInterval]}
                  onValueChange={(value) => setRefreshInterval(value[0])}
                  min={5}
                  max={300}
                  step={5}
                />
                <div className="text-sm text-muted-foreground">
                  Current interval: {refreshInterval} seconds
                </div>
              </div>
            </div>
            <SheetFooter>
              <Button onClick={savePreferences}>Save Preferences</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
