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
  Shield,
  AlertTriangle,
  Users,
  Lock,
  Key,
  FileText,
  Eye,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Download,
  Clock,
  Activity,
  Network,
  Fingerprint,
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'access' | 'auth' | 'data' | 'threat' | 'compliance' | 'audit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  source: {
    type: string;
    name: string;
    ip?: string;
  };
  status: 'detected' | 'investigating' | 'resolved' | 'ignored';
  details: Record<string, unknown>;
}

interface ComplianceCheck {
  id: string;
  name: string;
  standard: string;
  status: 'passed' | 'failed' | 'warning';
  lastCheck: string;
  details: string;
  impact: 'low' | 'medium' | 'high';
  recommendation?: string;
}

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  timeframe: string;
}

const SecurityDashboard = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample security events
  const securityEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'auth',
      severity: 'high',
      title: 'Multiple Failed Login Attempts',
      description: 'Detected multiple failed login attempts from unusual IP addresses',
      timestamp: '2025-01-31T05:45:00',
      source: {
        type: 'auth_service',
        name: 'User Authentication',
        ip: '192.168.1.100',
      },
      status: 'investigating',
      details: {
        attempts: 15,
        timeWindow: '5m',
        affectedUsers: ['john.doe', 'admin'],
      },
    },
    {
      id: '2',
      type: 'data',
      severity: 'critical',
      title: 'Sensitive Data Access',
      description: 'Unauthorized attempt to access production database',
      timestamp: '2025-01-31T05:30:00',
      source: {
        type: 'database',
        name: 'Production DB',
        ip: '10.0.0.50',
      },
      status: 'detected',
      details: {
        database: 'prod_logs',
        query: 'SELECT * FROM sensitive_data',
        user: 'system',
      },
    },
  ];

  // Sample compliance checks
  const complianceChecks: ComplianceCheck[] = [
    {
      id: '1',
      name: 'Password Policy',
      standard: 'SOC2',
      status: 'passed',
      lastCheck: '2025-01-31T05:00:00',
      details: 'Password requirements meet security standards',
      impact: 'high',
    },
    {
      id: '2',
      name: 'Data Encryption',
      standard: 'GDPR',
      status: 'warning',
      lastCheck: '2025-01-31T04:45:00',
      details: 'Some data transfers not using latest encryption',
      impact: 'medium',
      recommendation: 'Upgrade TLS to version 1.3',
    },
  ];

  // Sample security metrics
  const securityMetrics: SecurityMetric[] = [
    {
      id: '1',
      name: 'Security Score',
      value: 85,
      trend: 'up',
      change: 5,
      timeframe: '30d',
    },
    {
      id: '2',
      name: 'Vulnerabilities',
      value: 12,
      trend: 'down',
      change: 3,
      timeframe: '7d',
    },
    {
      id: '3',
      name: 'Failed Logins',
      value: 45,
      trend: 'up',
      change: 12,
      timeframe: '24h',
    },
    {
      id: '4',
      name: 'Data Access',
      value: 1250,
      trend: 'stable',
      change: 0,
      timeframe: '24h',
    },
  ];

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'access':
        return <Key className="h-5 w-5" />;
      case 'auth':
        return <Lock className="h-5 w-5" />;
      case 'data':
        return <FileText className="h-5 w-5" />;
      case 'threat':
        return <AlertTriangle className="h-5 w-5" />;
      case 'compliance':
        return <Shield className="h-5 w-5" />;
      case 'audit':
        return <Eye className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 text-red-700';
      case 'high':
        return 'bg-orange-50 text-orange-700';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700';
      case 'low':
        return 'bg-green-50 text-green-700';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Security & Compliance</h1>
          <p className="text-muted-foreground">
            Monitor and manage security events, compliance, and access control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Security Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {securityMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.name}
                </p>
                {metric.trend === 'up' ? (
                  <Activity className="h-4 w-4 text-green-500" />
                ) : metric.trend === 'down' ? (
                  <Activity className="h-4 w-4 text-red-500" />
                ) : (
                  <Activity className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-muted-foreground">
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}% from last {metric.timeframe}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Security Events</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {securityEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getSeverityColor(event.severity)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge variant="outline" className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {event.source.type} - {event.source.name}
                          </span>
                        </div>
                        {event.source.ip && (
                          <div className="flex items-center gap-2">
                            <Fingerprint className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{event.source.ip}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                        <Button size="sm">Take Action</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Compliance Checks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Compliance Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceChecks.map((check) => (
            <Card key={check.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{check.name}</h3>
                      <Badge variant="outline">{check.standard}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{check.details}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      check.status === 'passed'
                        ? 'bg-green-50 text-green-700'
                        : check.status === 'warning'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                    }
                  >
                    {check.status}
                  </Badge>
                </div>
                {check.recommendation && (
                  <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg">
                    <p className="text-sm">
                      <AlertTriangle className="inline-block mr-2 h-4 w-4" />
                      Recommendation: {check.recommendation}
                    </p>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last checked: {new Date(check.lastCheck).toLocaleString()}
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Check
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Shield className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-medium">Security Scan</h3>
                <p className="text-sm text-muted-foreground">
                  Run a full security assessment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Users className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <h3 className="font-medium">Access Review</h3>
                <p className="text-sm text-muted-foreground">
                  Review user permissions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <FileText className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-medium">Compliance Report</h3>
                <p className="text-sm text-muted-foreground">
                  Generate compliance report
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityDashboard;
