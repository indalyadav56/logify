import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  FileText,
  BarChart2,
  Calendar,
  Clock,
  Download,
  Mail,
  Plus,
  Copy,
  Edit,
  Eye,
  Share2,
  RefreshCw,
  Filter,
  LineChart,
  LayoutGrid,
  Archive,
  Shield,
  Database,
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'analytics' | 'audit' | 'compliance' | 'custom';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    nextRun: string;
    timezone: string;
  };
  delivery: {
    method: 'email' | 'download' | 'api';
    recipients?: string[];
    format: 'pdf' | 'csv' | 'excel' | 'json';
  };
  template: {
    sections: {
      title: string;
      type: 'table' | 'chart' | 'summary' | 'custom';
      config: Record<string, unknown>;
    }[];
    filters: {
      field: string;
      operator: string;
      value: any;
    }[];
    sorting: {
      field: string;
      direction: 'asc' | 'desc';
    }[];
  };
  lastRun?: {
    timestamp: string;
    status: 'success' | 'failed' | 'pending';
    duration: number;
    size: number;
  };
  creator: {
    name: string;
    email: string;
  };
  created: string;
  modified: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  preview: string;
  usageCount: number;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  connection: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
}

const ReportGenerator = () => {
  const [viewMode, setViewMode] = useState<'all' | 'scheduled' | 'custom'>('all');

  // Sample reports
  const reports: Report[] = [
    {
      id: '1',
      name: 'Monthly Performance Report',
      description: 'Detailed analysis of system performance metrics',
      type: 'performance',
      schedule: {
        frequency: 'monthly',
        nextRun: '2025-02-01T00:00:00',
        timezone: 'UTC',
      },
      delivery: {
        method: 'email',
        recipients: ['team@example.com'],
        format: 'pdf',
      },
      template: {
        sections: [
          {
            title: 'System Overview',
            type: 'summary',
            config: {
              metrics: ['cpu', 'memory', 'storage', 'network'],
            },
          },
          {
            title: 'Performance Trends',
            type: 'chart',
            config: {
              chartType: 'line',
              metrics: ['response_time', 'throughput'],
              timeRange: '30d',
            },
          },
        ],
        filters: [
          {
            field: 'environment',
            operator: 'eq',
            value: 'production',
          },
        ],
        sorting: [
          {
            field: 'timestamp',
            direction: 'desc',
          },
        ],
      },
      lastRun: {
        timestamp: '2025-01-31T00:00:00',
        status: 'success',
        duration: 45,
        size: 2500000,
      },
      creator: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      created: '2025-01-15T10:00:00',
      modified: '2025-01-31T06:15:00',
    },
    {
      id: '2',
      name: 'Weekly Compliance Audit',
      description: 'Compliance status and violations report',
      type: 'compliance',
      schedule: {
        frequency: 'weekly',
        nextRun: '2025-02-07T00:00:00',
        timezone: 'UTC',
      },
      delivery: {
        method: 'email',
        recipients: ['compliance@example.com'],
        format: 'pdf',
      },
      template: {
        sections: [
          {
            title: 'Compliance Summary',
            type: 'summary',
            config: {
              metrics: ['violations', 'risks', 'actions'],
            },
          },
          {
            title: 'Violation Details',
            type: 'table',
            config: {
              columns: ['rule', 'severity', 'status', 'action'],
            },
          },
        ],
        filters: [
          {
            field: 'severity',
            operator: 'gte',
            value: 'high',
          },
        ],
        sorting: [
          {
            field: 'severity',
            direction: 'desc',
          },
        ],
      },
      lastRun: {
        timestamp: '2025-01-24T00:00:00',
        status: 'success',
        duration: 32,
        size: 1800000,
      },
      creator: {
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      created: '2025-01-20T14:30:00',
      modified: '2025-01-31T05:45:00',
    },
  ];

  // Sample templates
  const templates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Performance Dashboard',
      description: 'System performance metrics and trends',
      type: 'performance',
      preview: '/templates/performance.png',
      usageCount: 45,
    },
    {
      id: '2',
      name: 'Compliance Summary',
      description: 'Compliance status and violations overview',
      type: 'compliance',
      preview: '/templates/compliance.png',
      usageCount: 32,
    },
  ];

  // Sample data sources
  const dataSources: DataSource[] = [
    {
      id: '1',
      name: 'System Metrics DB',
      type: 'postgresql',
      connection: 'postgresql://metrics:5432',
      status: 'active',
      lastSync: '2025-01-31T06:00:00',
    },
    {
      id: '2',
      name: 'Audit Logs',
      type: 'elasticsearch',
      connection: 'http://elasticsearch:9200',
      status: 'active',
      lastSync: '2025-01-31T06:15:00',
    },
  ];

  const getReportTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'performance':
        return <BarChart2 className="h-4 w-4" />;
      case 'analytics':
        return <LineChart className="h-4 w-4" />;
      case 'audit':
        return <FileText className="h-4 w-4" />;
      case 'compliance':
        return <Shield className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Report Generator</h1>
          <p className="text-muted-foreground">
            Create, schedule, and manage custom reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 space-y-6">
          {/* Templates */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-medium mb-4">Report Templates</h2>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-2 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h3 className="text-sm font-medium">
                          {template.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Used {template.usageCount} times
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">Data Sources</h2>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {dataSources.map((source) => (
                  <div
                    key={source.id}
                    className="p-2 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-primary/10 rounded">
                          <Database className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">
                            {source.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {source.type}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          source.status === 'active'
                            ? 'bg-green-50 text-green-700'
                            : source.status === 'error'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }
                      >
                        {source.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="col-span-9">
          <Card>
            <CardContent className="p-4">
              {/* Filters */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('all')}
                  >
                    All Reports
                  </Button>
                  <Button
                    variant={viewMode === 'scheduled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('scheduled')}
                  >
                    Scheduled
                  </Button>
                  <Button
                    variant={viewMode === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('custom')}
                  >
                    Custom
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Reports */}
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getReportTypeIcon(report.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{report.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">
                              {report.type}
                            </Badge>
                            {report.schedule && (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                {report.schedule.frequency}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Report Details */}
                    <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Schedule</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {report.schedule
                              ? new Date(
                                  report.schedule.nextRun
                                ).toLocaleDateString()
                              : 'Not scheduled'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Run</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {report.lastRun
                              ? new Date(
                                  report.lastRun.timestamp
                                ).toLocaleDateString()
                              : 'Never'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Delivery</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {report.delivery.method} ({report.delivery.format})
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {report.lastRun
                              ? formatFileSize(report.lastRun.size)
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Report Actions */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Created by {report.creator.name}
                        </span>
                        <span>•</span>
                        <span>
                          Modified{' '}
                          {new Date(report.modified).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </Button>
                        <Button variant="outline" size="sm">
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
