import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Archive,
  Clock,
  Filter,
  Key,
  RefreshCw,
  Search,
  Settings,
  Shield,
  User,
  Database,
  Eye,
  Download,
  X,
} from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  type: 'auth' | 'data' | 'system' | 'security' | 'user';
  action: string;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  resource: {
    type: string;
    id: string;
    name: string;
  };
  metadata: {
    ip: string;
    userAgent: string;
    location?: string;
    device?: string;
  };
  details: {
    before?: any;
    after?: any;
    reason?: string;
    impact?: string;
  };
  related?: {
    events: string[];
    resources: string[];
  };
}

interface AuditFilter {
  id: string;
  name: string;
  type: 'type' | 'status' | 'severity' | 'user' | 'resource' | 'date';
  value: unknown;
}

const AuditLog = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  // Sample audit events
  const auditEvents: AuditEvent[] = [
    {
      id: '1',
      timestamp: '2025-01-31T06:45:00',
      type: 'security',
      action: 'login_attempt',
      status: 'failure',
      severity: 'high',
      user: {
        id: 'u123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
      },
      resource: {
        type: 'auth',
        id: 'auth123',
        name: 'Authentication Service',
      },
      metadata: {
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        location: 'New York, US',
        device: 'Windows 10 / Chrome',
      },
      details: {
        reason: 'Invalid credentials',
        impact: 'Access denied to system',
      },
      related: {
        events: ['e456', 'e789'],
        resources: ['r456'],
      },
    },
    {
      id: '2',
      timestamp: '2025-01-31T06:30:00',
      type: 'data',
      action: 'record_update',
      status: 'success',
      severity: 'medium',
      user: {
        id: 'u456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'editor',
      },
      resource: {
        type: 'database',
        id: 'db123',
        name: 'User Database',
      },
      metadata: {
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        location: 'London, UK',
        device: 'MacOS / Safari',
      },
      details: {
        before: { status: 'active' },
        after: { status: 'inactive' },
        impact: 'User status updated',
      },
    },
  ];

  // Sample filters
  const activeFilters: AuditFilter[] = [
    {
      id: '1',
      name: 'High Severity',
      type: 'severity',
      value: 'high',
    },
    {
      id: '2',
      name: 'Security Events',
      type: 'type',
      value: 'security',
    },
  ];

  const getEventTypeIcon = (type: AuditEvent['type']) => {
    switch (type) {
      case 'auth':
        return <Key className="h-4 w-4" />;
      case 'data':
        return <Database className="h-4 w-4" />;
      case 'system':
        return <Activity className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventStatusColor = (status: AuditEvent['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700';
      case 'failure':
        return 'bg-red-50 text-red-700';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return '';
    }
  };

  const getEventSeverityColor = (severity: AuditEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 text-red-700';
      case 'high':
        return 'bg-orange-50 text-orange-700';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700';
      case 'low':
        return 'bg-blue-50 text-blue-700';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">
            Track and monitor system activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="data">Data Changes</SelectItem>
                  <SelectItem value="system">System Events</SelectItem>
                  <SelectItem value="security">Security Events</SelectItem>
                </SelectContent>
              </Select>
              <Select
                defaultValue={selectedSeverity}
                onValueChange={setSelectedSeverity}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-8 h-9 w-[300px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active Filters:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Events */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {auditEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg border hover:bg-muted/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{event.action}</h3>
                        <Badge
                          variant="outline"
                          className={getEventStatusColor(event.status)}
                        >
                          {event.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getEventSeverityColor(event.severity)}
                        >
                          {event.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{event.user.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Database className="h-4 w-4" />
                          <span>
                            {event.resource.type}: {event.resource.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Event Details */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Metadata</h4>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>IP Address:</span>
                        <span>{event.metadata.ip}</span>
                      </div>
                      {event.metadata.location && (
                        <div className="flex items-center gap-2">
                          <span>Location:</span>
                          <span>{event.metadata.location}</span>
                        </div>
                      )}
                      {event.metadata.device && (
                        <div className="flex items-center gap-2">
                          <span>Device:</span>
                          <span>{event.metadata.device}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    <div className="space-y-1 text-muted-foreground">
                      {event.details.reason && (
                        <div className="flex items-center gap-2">
                          <span>Reason:</span>
                          <span>{event.details.reason}</span>
                        </div>
                      )}
                      {event.details.impact && (
                        <div className="flex items-center gap-2">
                          <span>Impact:</span>
                          <span>{event.details.impact}</span>
                        </div>
                      )}
                      {event.details.before && event.details.after && (
                        <div>
                          <div className="flex items-center gap-2">
                            <span>Changes:</span>
                            <Badge variant="outline">
                              {JSON.stringify(event.details.before)} →{' '}
                              {JSON.stringify(event.details.after)}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Related Events */}
                {event.related && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Related Events</h4>
                    <div className="flex items-center gap-2">
                      {event.related.events.map((relatedEvent) => (
                        <Badge
                          key={relatedEvent}
                          variant="outline"
                          className="cursor-pointer"
                        >
                          Event #{relatedEvent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;
