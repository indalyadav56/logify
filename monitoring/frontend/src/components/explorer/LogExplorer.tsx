import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Save,
  Share,
  Download,
  Clock,
  Calendar as CalendarIcon,
  AlertCircle,
  Info,
  Brain,
  Zap,
  LineChart,
  Network,
  Layers,
  RefreshCw,
  BookOpen,
  Wand2,
  Settings2,
  FolderTree,
} from 'lucide-react';
import { format } from 'date-fns';
import LogVisualizer3D from '../visualizations/LogVisualizer3D';

const LogExplorer = () => {
  const [view, setView] = useState('table');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [timeRange, setTimeRange] = useState('15m');

  // Sample log data
  const logs = [
    {
      id: '1',
      timestamp: '2025-01-30T06:20:15',
      level: 'error',
      service: 'api-gateway',
      message: 'Failed to authenticate user: Invalid token',
      source: 'auth.service.ts',
      traceId: 'trace-123',
      userId: 'user-456',
      duration: 145,
      status: 401
    },
    // ... more logs
  ];

  // Sample saved queries
  const savedQueries = [
    {
      name: 'Auth Failures',
      query: 'level:error AND service:api-gateway',
      category: 'Security'
    },
    {
      name: 'High Latency',
      query: 'duration > 1000',
      category: 'Performance'
    }
  ];

  // Sample AI insights
  const aiInsights = [
    {
      type: 'anomaly',
      message: 'Unusual spike in authentication failures',
      severity: 'high',
      timestamp: '5 minutes ago'
    },
    {
      type: 'pattern',
      message: 'Correlated errors across multiple services',
      severity: 'medium',
      timestamp: '15 minutes ago'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Log Explorer</h1>
          <p className="text-muted-foreground">
            Advanced log analysis and visualization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Share className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Query
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Brain className="h-4 w-4" />
            AI Analysis
          </Button>
        </div>
      </div>

      {/* Query Builder */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Query Builder</CardTitle>
              <CardDescription>
                Build complex queries with advanced filters
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isLiveMode}
                  onCheckedChange={setIsLiveMode}
                />
                <Label>Live Mode</Label>
              </div>
              <Select defaultValue={timeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">Last 15m</SelectItem>
                  <SelectItem value="1h">Last 1h</SelectItem>
                  <SelectItem value="6h">Last 6h</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7d</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search logs... (e.g., level:error AND service:api-gateway)"
                  className="w-full"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Query Examples
              </Button>
              <Button className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-2">
                level:error
                <button className="ml-1">&times;</button>
              </Badge>
              <Badge variant="outline" className="gap-2">
                service:api-gateway
                <button className="ml-1">&times;</button>
              </Badge>
              <Badge variant="outline" className="gap-2">
                100
                <button className="ml-1">&times;</button>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          {/* Saved Queries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Queries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedQueries.map((query, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{query.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {query.query}
                    </p>
                  </div>
                  <Badge variant="outline">{query.category}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    {insight.type === 'anomaly' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Info className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="font-medium capitalize">
                      {insight.type}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        insight.severity === 'high'
                          ? 'bg-red-50'
                          : 'bg-yellow-50'
                      }
                    >
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="text-sm">{insight.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {insight.timestamp}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="col-span-3 space-y-6">
          {/* View Controls */}
          <Card>
            <CardContent className="py-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={view === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('table')}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Table
                  </Button>
                  <Button
                    variant={view === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('json')}
                  >
                    <FolderTree className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button
                    variant={view === 'timeline' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('timeline')}
                  >
                    <LineChart className="h-4 w-4 mr-2" />
                    Timeline
                  </Button>
                  <Button
                    variant={view === '3d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('3d')}
                  >
                    <Network className="h-4 w-4 mr-2" />
                    3D View
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                  <Button variant="outline" size="sm">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Auto-format
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Log Content */}
          <Card>
            <CardContent className="p-0">
              {view === 'table' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {format(new Date(log.timestamp), 'HH:mm:ss')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              log.level === 'error'
                                ? 'bg-red-50'
                                : log.level === 'warn'
                                ? 'bg-yellow-50'
                                : 'bg-green-50'
                            }
                          >
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.service}</TableCell>
                        <TableCell>
                          <div className="max-w-md truncate">
                            {log.message}
                          </div>
                        </TableCell>
                        <TableCell>{log.duration}ms</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Brain className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {view === 'json' && (
                <pre className="p-4 bg-muted rounded-lg overflow-auto">
                  {JSON.stringify(logs[0], null, 2)}
                </pre>
              )}

              {view === 'timeline' && (
                <div className="p-4">
                  {/* Timeline visualization would go here */}
                  <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    Timeline Visualization
                  </div>
                </div>
              )}

              {view === '3d' && (
                <div className="p-4">
                  <LogVisualizer3D
                    data={logs.map(log => ({
                      timestamp: new Date(log.timestamp).getTime(),
                      severity: log.level as 'info' | 'warning' | 'error',
                      category: log.service,
                      value: log.duration / 100
                    }))}
                    width={800}
                    height={400}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Context Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Context & Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Related Events</h4>
              <div className="space-y-2">
                <div className="p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>2 similar errors in last 5m</span>
                  </div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    <span>Service dependencies affected</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">AI Analysis</h4>
              <div className="space-y-2">
                <div className="p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>Pattern detected: Auth failure cascade</span>
                  </div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Suggested action: Check token service</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <p className="text-lg font-bold">2.3%</p>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-lg font-bold">145ms</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogExplorer;
