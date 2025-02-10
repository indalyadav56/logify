import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import {
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Download,
  Calendar,
  Clock,
  Plus,
  Share2,
  Settings,
  RefreshCw,
  Mail,
  Eye,
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'scheduled' | 'template';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  lastRun?: string;
  nextRun?: string;
  visualizations: {
    id: string;
    type: 'bar' | 'line' | 'pie' | 'table';
    title: string;
    data: any;
    settings: {
      xAxis?: string;
      yAxis?: string;
      groupBy?: string;
      metrics?: string[];
    };
  }[];
  filters: {
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less';
    value: string;
  }[];
  exports: {
    format: 'pdf' | 'csv' | 'excel';
    scheduled: boolean;
  }[];
}

const ReportBuilder = () => {
  const [selectedReport, setSelectedReport] = useState<string>();
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Sample reports
  const reports: Report[] = [
    {
      id: '1',
      name: 'System Performance Overview',
      description: 'Daily performance metrics and trends',
      type: 'dashboard',
      lastRun: '2025-01-31T05:00:00',
      visualizations: [
        {
          id: 'v1',
          type: 'line',
          title: 'CPU Usage Trend',
          data: {
            labels: ['Jan 28', 'Jan 29', 'Jan 30', 'Jan 31'],
            datasets: [
              {
                label: 'Usage %',
                data: [45, 62, 58, 71],
              },
            ],
          },
          settings: {
            xAxis: 'date',
            yAxis: 'percentage',
          },
        },
        {
          id: 'v2',
          type: 'bar',
          title: 'Error Distribution',
          data: {
            labels: ['Critical', 'Error', 'Warning', 'Info'],
            datasets: [
              {
                label: 'Count',
                data: [12, 45, 78, 245],
              },
            ],
          },
          settings: {
            xAxis: 'level',
            yAxis: 'count',
          },
        },
      ],
      filters: [
        {
          field: 'date',
          operator: 'greater',
          value: '2025-01-28',
        },
      ],
      exports: [
        {
          format: 'pdf',
          scheduled: true,
        },
        {
          format: 'csv',
          scheduled: false,
        },
      ],
    },
    {
      id: '2',
      name: 'Security Audit Report',
      description: 'Weekly security metrics and incidents',
      type: 'scheduled',
      schedule: {
        frequency: 'weekly',
        time: '00:00',
        recipients: ['security@company.com'],
      },
      lastRun: '2025-01-24T00:00:00',
      nextRun: '2025-01-31T00:00:00',
      visualizations: [
        {
          id: 'v3',
          type: 'pie',
          title: 'Incident Types',
          data: {
            labels: ['Access Violation', 'Data Breach', 'System Error'],
            datasets: [
              {
                data: [35, 15, 50],
              },
            ],
          },
          settings: {
            groupBy: 'type',
          },
        },
      ],
      filters: [
        {
          field: 'severity',
          operator: 'equals',
          value: 'high',
        },
      ],
      exports: [
        {
          format: 'pdf',
          scheduled: true,
        },
      ],
    },
  ];

  const getChartIcon = (type: Report['visualizations'][0]['type']) => {
    switch (type) {
      case 'bar':
        return <BarChart3 className="h-5 w-5" />;
      case 'line':
        return <LineChart className="h-5 w-5" />;
      case 'pie':
        return <PieChart className="h-5 w-5" />;
      case 'table':
        return <Table className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Report Builder</h1>
          <p className="text-muted-foreground">
            Create, schedule, and manage custom reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateReportOpen} onOpenChange={setIsCreateReportOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>
                  Design a custom report with visualizations and scheduling
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Report Name</Label>
                    <Input placeholder="Enter report name" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input placeholder="Enter report description" />
                  </div>
                  <div>
                    <Label>Report Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="scheduled">Scheduled Report</SelectItem>
                        <SelectItem value="template">Report Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateReportOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateReportOpen(false)}>
                  Create Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Reports List */}
        <div className="col-span-12 space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{report.name}</h3>
                      <Badge variant="outline">
                        {report.type}
                      </Badge>
                      {report.schedule && (
                        <Badge variant="secondary">
                          {report.schedule.frequency}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {report.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Run Now
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {report.visualizations.map((viz) => (
                    <Card key={viz.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getChartIcon(viz.type)}
                            <span className="font-medium">{viz.title}</span>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          {getChartIcon(viz.type)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Last run: {new Date(report.lastRun!).toLocaleString()}
                      </span>
                    </div>
                    {report.nextRun && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Next run: {new Date(report.nextRun).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
