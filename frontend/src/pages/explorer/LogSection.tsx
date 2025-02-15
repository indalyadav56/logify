import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Copy, AlertTriangle, Info, FileText, Maximize2,
  Share2, Download, Terminal, Filter, Bookmark, BookmarkCheck, 
  Search, Table, BarChart2, List, 
  Calendar, Trash2, Save, Columns,
  Settings, RefreshCw, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectItem } from "@/components/ui/select";

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

type ViewMode = 'list' | 'table' | 'timeline' | 'compact';
type Theme = 'light' | 'dark' | 'system';

export default function LogSection({ logs }: LogSectionProps) {
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [timeFormat, setTimeFormat] = useState<'relative' | 'absolute'>('relative');
  const [bookmarkedLogs, setBookmarkedLogs] = useState<Set<string>>(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [quickFilter, setQuickFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const [fontSize, setFontSize] = useState(14);
  const [compactMode, setCompactMode] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(['level', 'message', 'timestamp', 'service']));
  const [customFilters, setCustomFilters] = useState<Array<{id: string; field: string; value: string}>>([]);
  const [savedViews, setSavedViews] = useState<Array<{id: string; name: string; filters: any}>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastRefresh, setLastRefresh] = useState(new Date());

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

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh - replace this with your actual refresh logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
      toast.success('Logs refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh logs');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Toggle time format
  const toggleTimeFormat = useCallback(() => {
    setTimeFormat(prev => prev === 'relative' ? 'absolute' : 'relative');
    toast.success(`Switched to ${timeFormat === 'relative' ? 'absolute' : 'relative'} time format`);
  }, [timeFormat]);

  // Load user preferences from localStorage
  useEffect(() => {
    const loadPreferences = () => {
      const savedPrefs = localStorage.getItem('logifyPreferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        setTheme(prefs.theme || 'system');
        setFontSize(prefs.fontSize || 14);
        setCompactMode(prefs.compactMode || false);
        setShowLineNumbers(prefs.showLineNumbers || true);
        setVisibleColumns(new Set(prefs.visibleColumns || ['level', 'message', 'timestamp', 'service']));
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
    localStorage.setItem('logifyPreferences', JSON.stringify(prefs));
    toast.success('Preferences saved successfully');
  }, [theme, fontSize, compactMode, showLineNumbers, visibleColumns]);

  // Calculate statistics
  useEffect(() => {
    const calculateStats = () => {
      const errorCount = logs.filter(log => log.level.toLowerCase() === 'error').length;
      const warningCount = logs.filter(log => log.level.toLowerCase() === 'warning').length;
      const infoCount = logs.filter(log => log.level.toLowerCase() === 'info').length;
      
      // Calculate logs per minute
      const timestamps = logs.map(log => new Date(log.timestamp).getTime());
      const timeRange = Math.max(...timestamps) - Math.min(...timestamps);
      const avgLogsPerMinute = timeRange > 0 ? (logs.length / (timeRange / 60000)) : 0;
     
    };
    calculateStats();
  }, [logs]);

  // Bulk actions for selected logs
  const handleBulkAction = (action: 'delete' | 'export' | 'bookmark') => {
    switch (action) {
      case 'delete':
        toast.error('Selected logs will be deleted');
        setSelectedLogs(new Set());
        break;
      case 'export':
        const selectedLogData = logs.filter(log => selectedLogs.has(log.id));
        const blob = new Blob([JSON.stringify(selectedLogData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-export-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`${selectedLogs.size} logs exported successfully`);
        break;
      case 'bookmark':
        selectedLogs.forEach(id => {
          setBookmarkedLogs(prev => {
            const newBookmarks = new Set(prev);
            newBookmarks.add(id);
            return newBookmarks;
          });
        });
        toast.success(`${selectedLogs.size} logs bookmarked`);
        break;
    }
  };

  // Save current view
  const saveCurrentView = () => {
    const newView = {
      id: Date.now().toString(),
      name: `View ${savedViews.length + 1}`,
      filters: {
        quickFilter,
        showBookmarkedOnly,
        sortOrder,
        customFilters,
        viewMode,
      },
    };
    setSavedViews(prev => [...prev, newView]);
    toast.success('View saved successfully');
  };

  // Apply saved view
  const applyView = (view: typeof savedViews[0]) => {
    setQuickFilter(view.filters.quickFilter);
    setShowBookmarkedOnly(view.filters.showBookmarkedOnly);
    setSortOrder(view.filters.sortOrder);
    setCustomFilters(view.filters.customFilters);
    setViewMode(view.filters.viewMode);
    toast.success('View applied successfully');
  };

  const filteredAndSortedLogs = logs
    .filter(log => {
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
          Object.entries(log.metadata).some(([key, value]) => 
            key.toLowerCase().includes(searchTerm) || 
            value.toLowerCase().includes(searchTerm)
          )
        );
      }
      return true;
    })
    .sort((a, b) => {
      const comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sortOrder === 'desc' ? comparison : -comparison;
    });

  const formatTimestamp = (timestamp: string) => {
    if (timeFormat === 'relative') {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    }
    return new Date(timestamp).toLocaleString();
  };

  const getLevelDetails = (level: string) => {
    switch (level.toUpperCase()) {
      case "ERROR":
        return {
          color: "bg-red-500/10 text-red-500 border-red-200",
          icon: <AlertTriangle className="h-4 w-4" />,
          borderColor: "#ef4444"
        };
      case "WARNING":
        return {
          color: "bg-yellow-500/10 text-yellow-500 border-yellow-200",
          icon: <AlertTriangle className="h-4 w-4" />,
          borderColor: "#f59e0b"
        };
      case "INFO":
        return {
          color: "bg-blue-500/10 text-blue-500 border-blue-200",
          icon: <Info className="h-4 w-4" />,
          borderColor: "#3b82f6"
        };
      default:
        return {
          color: "bg-gray-500/10 text-gray-500 border-gray-200",
          icon: <Info className="h-4 w-4" />,
          borderColor: "#6b7280"
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Quick filter logs..."
                className="pl-8"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
              />
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

            <Button
              variant="outline"
              size="icon"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-primary/10" : ""}
            >
              <Clock className="h-4 w-4" />
            </Button>

            <div className="text-sm text-muted-foreground">
              Last refreshed: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
              {autoRefresh && ` • Auto-refresh every ${refreshInterval}s`}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCustomFilters([...customFilters, { id: Date.now().toString(), field: 'level', value: '' }])}>
                  Add Custom Filter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {customFilters.map(filter => (
                  <DropdownMenuItem key={filter.id} onSelect={(e) => e.preventDefault()}>
                    <div className="flex items-center gap-2">
                      <Input
                        value={filter.value}
                        onChange={(e) => {
                          const newFilters = customFilters.map(f =>
                            f.id === filter.id ? { ...f, value: e.target.value } : f
                          );
                          setCustomFilters(newFilters);
                        }}
                        className="w-32"
                        placeholder={`Filter by ${filter.field}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCustomFilters(customFilters.filter(f => f.id !== filter.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Columns className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.has('level')}
                  onCheckedChange={(checked) => {
                    const newColumns = new Set(visibleColumns);
                    checked ? newColumns.add('level') : newColumns.delete('level');
                    setVisibleColumns(newColumns);
                  }}
                >
                  Level
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.has('message')}
                  onCheckedChange={(checked) => {
                    const newColumns = new Set(visibleColumns);
                    checked ? newColumns.add('message') : newColumns.delete('message');
                    setVisibleColumns(newColumns);
                  }}
                >
                  Message
                </DropdownMenuCheckboxItem>
                {/* Add more column options */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <BarChart2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Log Statistics</h4>
                    <Progress value={100} className="h-2 bg-red-100" />
                    <div className="text-xs text-muted-foreground">
                      Errors: 1%
                    </div>
                    <Progress value={100} className="h-2 bg-yellow-100" />
                    <div className="text-xs text-muted-foreground">
                      Warnings: 0% 
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Avg. Logs/min: 1
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

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
                {savedViews.map(view => (
                  <DropdownMenuItem key={view.id} onClick={() => applyView(view)}>
                    {view.name}
                  </DropdownMenuItem>
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
                    <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tabs>
              <TabsList>
              <TabsTrigger value="list" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
              <TabsTrigger value="table" onClick={() => setViewMode('table')}>
                <Table className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
              <TabsTrigger value="timeline" onClick={() => setViewMode('timeline')}>
                <Calendar className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
            </TabsList>
            </Tabs>
          </div>

          {selectedLogs.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedLogs.size} logs selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('bookmark')}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmark All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {filteredAndSortedLogs.map((log, index) => {
            const levelDetails = getLevelDetails(log.level);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="group relative hover:shadow-md transition-all duration-200 border-l-4 w-full"
                  style={{ borderLeftColor: levelDetails.borderColor }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={`flex items-center gap-1.5 ${levelDetails.color} shrink-0`}>
                          {levelDetails.icon}
                          {log.level}
                        </Badge>
                        <Badge variant="outline" className="font-mono shrink-0">
                          {log.service}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm text-muted-foreground p-0 h-auto font-normal hover:text-primary"
                          // onClick={toggleTimeFormat}
                        >
                          {formatTimestamp(log.timestamp)}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => toggleBookmark(log.id)}
                        >
                          {bookmarkedLogs.has(log.id) ? (
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Terminal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopy(JSON.stringify(log, null, 2), log.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy as JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(log)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Log
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(log)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              const query = `level:${log.level} service:${log.service}`;
                              setQuickFilter(query);
                              toast.success(`Quick filter set to: ${query}`);
                            }}>
                              <Filter className="h-4 w-4 mr-2" />
                              Filter Similar Logs
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="font-mono text-sm text-muted-foreground break-all">
                        {log.message}
                      </div>
                      
                      {(log.action || log.file || log.func_name) && (
                        <div className="grid gap-2 text-xs text-muted-foreground font-mono">
                          {log.action && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium shrink-0">Action:</span>
                              <span className="break-all">{log.action}</span>
                            </div>
                          )}
                          {log.file && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium shrink-0">File:</span>
                              <span className="break-all">{log.file}</span>
                            </div>
                          )}
                          {log.func_name && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium shrink-0">Function:</span>
                              <span className="break-all">{log.func_name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {Object.keys(log.metadata).length > 0 && (
                        <CardDescription>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex flex-wrap gap-2 cursor-pointer">
                                {Object.entries(log.metadata)
                                  .slice(0, 3)
                                  .map(([key, value]) => (
                                    <Badge key={key} variant="secondary" className="text-xs inline-flex items-center max-w-[200px]">
                                      <span className="truncate">
                                        {key}: {value}
                                      </span>
                                    </Badge>
                                  ))}
                                {Object.keys(log.metadata).length > 3 && (
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    +{Object.keys(log.metadata).length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Metadata</h4>
                                <div className="grid gap-1">
                                  {Object.entries(log.metadata).map(([key, value]) => (
                                    <div key={key} className="grid grid-cols-[auto,1fr] gap-2 text-xs items-center">
                                      <span className="font-medium text-muted-foreground whitespace-nowrap">{key}:</span>
                                      <span className="font-mono truncate">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </CardDescription>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`flex items-center gap-1.5 ${selectedLog && getLevelDetails(selectedLog.level).color}`}>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedLog && handleShare(selectedLog)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedLog && handleDownload(selectedLog)}
                >
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
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all">{selectedLog?.message}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Metadata</h4>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                    {selectedLog && JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>

              {(selectedLog?.action || selectedLog?.file || selectedLog?.func_name) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Additional Information</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="grid gap-2 text-sm font-mono">
                      {selectedLog?.action && (
                        <div className="grid grid-cols-[100px,1fr] gap-2">
                          <span className="font-semibold">Action:</span>
                          <span className="break-all">{selectedLog.action}</span>
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
                          <span className="break-all">{selectedLog.func_name}</span>
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