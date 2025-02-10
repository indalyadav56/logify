import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  LayoutGrid,
  Plus,
  LineChart,
  BarChart3,
  PieChart,
  Table2,
  Gauge,
  Timer,
  ArrowUpDown,
  Trash2,
  Copy,
  Save,
  Share2,
  Download,
  Settings,
  Move,
  Maximize2,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Widget {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'table' | 'gauge' | 'counter';
  title: string;
  description?: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: {
    metrics: string[];
    timeRange: string;
    refreshInterval: number;
    thresholds?: {
      warning: number;
      critical: number;
    };
    query?: string;
  };
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  isPublic: boolean;
  lastModified: string;
  owner: {
    id: string;
    name: string;
  };
  sharedWith: {
    id: string;
    name: string;
    role: 'viewer' | 'editor';
  }[];
}

const DashboardBuilder = () => {
  const [selectedDashboard, setSelectedDashboard] = useState<string>('1');
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Sample dashboard data
  const dashboards: Dashboard[] = [
    {
      id: '1',
      name: 'Production Overview',
      description: 'Key metrics for production environment',
      widgets: [
        {
          id: 'w1',
          type: 'line',
          title: 'Error Rate',
          description: 'Error rate over time',
          size: 'medium',
          position: { x: 0, y: 0 },
          config: {
            metrics: ['error_rate'],
            timeRange: '24h',
            refreshInterval: 60,
            query: 'rate(http_errors_total[5m])',
          },
        },
        {
          id: 'w2',
          type: 'gauge',
          title: 'CPU Usage',
          size: 'small',
          position: { x: 1, y: 0 },
          config: {
            metrics: ['cpu_usage'],
            timeRange: '5m',
            refreshInterval: 30,
            thresholds: {
              warning: 70,
              critical: 90,
            },
          },
        },
      ],
      isPublic: false,
      lastModified: '2025-01-31T05:30:00',
      owner: {
        id: 'u1',
        name: 'John Doe',
      },
      sharedWith: [
        {
          id: 'u2',
          name: 'Jane Smith',
          role: 'viewer',
        },
      ],
    },
  ];

  const getWidgetIcon = (type: Widget['type']) => {
    switch (type) {
      case 'line':
        return <LineChart className="h-4 w-4" />;
      case 'bar':
        return <BarChart3 className="h-4 w-4" />;
      case 'pie':
        return <PieChart className="h-4 w-4" />;
      case 'table':
        return <Table2 className="h-4 w-4" />;
      case 'gauge':
        return <Gauge className="h-4 w-4" />;
      case 'counter':
        return <Timer className="h-4 w-4" />;
      default:
        return <LineChart className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Builder</h1>
          <p className="text-muted-foreground">
            Create and customize monitoring dashboards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={selectedDashboard} onValueChange={setSelectedDashboard}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select dashboard" />
            </SelectTrigger>
            <SelectContent>
              {dashboards.map((dashboard) => (
                <SelectItem key={dashboard.id} value={dashboard.id}>
                  {dashboard.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Widget</DialogTitle>
                <DialogDescription>
                  Configure a new widget for your dashboard
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Widget Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select widget type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="gauge">Gauge</SelectItem>
                        <SelectItem value="counter">Counter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input placeholder="Enter widget title" />
                  </div>
                  <div>
                    <Label>Metrics</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select metrics" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error_rate">Error Rate</SelectItem>
                        <SelectItem value="latency">Latency</SelectItem>
                        <SelectItem value="cpu_usage">CPU Usage</SelectItem>
                        <SelectItem value="memory_usage">Memory Usage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Range</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5m">Last 5 minutes</SelectItem>
                        <SelectItem value="1h">Last hour</SelectItem>
                        <SelectItem value="24h">Last 24 hours</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Refresh Interval</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select refresh interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddWidgetOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddWidgetOpen(false)}>
                  Add Widget
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setEditMode(!editMode)}>
            <Settings className="mr-2 h-4 w-4" />
            {editMode ? 'View Mode' : 'Edit Mode'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Dashboard Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Share Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {dashboards
          .find((d) => d.id === selectedDashboard)
          ?.widgets.map((widget) => (
            <Card
              key={widget.id}
              className={`${
                widget.size === 'large'
                  ? 'col-span-2 row-span-2'
                  : widget.size === 'medium'
                  ? 'col-span-2'
                  : ''
              } hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getWidgetIcon(widget.type)}
                    <h3 className="font-medium">{widget.title}</h3>
                  </div>
                  {editMode && (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Move className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="h-[200px] bg-muted rounded-lg flex items-center justify-center">
                  {getWidgetIcon(widget.type)}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span>{widget.config.timeRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <span>Refresh: {widget.config.refreshInterval}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default DashboardBuilder;
