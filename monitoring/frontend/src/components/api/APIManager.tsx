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
  Key,
  Settings,
  BarChart,
  Clock,
  AlertTriangle,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  Copy,
  Eye,
  EyeOff,
  Shield,
  Activity,
  Zap,
  History,
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface APIKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'revoked';
  created: string;
  lastUsed?: string;
  expiresAt?: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
  usage: {
    current: number;
    limit: number;
    resetAt: string;
  };
  metadata: {
    environment: string;
    project: string;
    owner: string;
  };
}

interface APIMetric {
  timestamp: string;
  requests: number;
  latency: number;
  errors: number;
  status: {
    '2xx': number;
    '4xx': number;
    '5xx': number;
  };
}

interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  version: string;
  deprecated?: boolean;
  auth: boolean;
  rateLimit?: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

const APIManager = () => {
  const [showKey, setShowKey] = useState<string[]>([]);
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>();

  // Sample API keys
  const apiKeys: APIKey[] = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'pk_live_51ABCxyz...',
      status: 'active',
      created: '2025-01-15T00:00:00',
      lastUsed: '2025-01-31T05:45:00',
      expiresAt: '2026-01-15T00:00:00',
      permissions: ['logs:read', 'logs:write', 'metrics:read'],
      rateLimit: {
        requests: 1000,
        period: 'hour',
      },
      usage: {
        current: 450,
        limit: 1000,
        resetAt: '2025-01-31T06:00:00',
      },
      metadata: {
        environment: 'production',
        project: 'main',
        owner: 'john@company.com',
      },
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'pk_test_51DEFabc...',
      status: 'active',
      created: '2025-01-20T00:00:00',
      lastUsed: '2025-01-31T05:30:00',
      permissions: ['logs:read', 'metrics:read'],
      rateLimit: {
        requests: 100,
        period: 'minute',
      },
      usage: {
        current: 45,
        limit: 100,
        resetAt: '2025-01-31T06:00:00',
      },
      metadata: {
        environment: 'development',
        project: 'test',
        owner: 'dev@company.com',
      },
    },
  ];

  // Sample API metrics
  const metrics: APIMetric[] = [
    {
      timestamp: '2025-01-31T05:45:00',
      requests: 1250,
      latency: 145,
      errors: 12,
      status: {
        '2xx': 1180,
        '4xx': 58,
        '5xx': 12,
      },
    },
    {
      timestamp: '2025-01-31T05:30:00',
      requests: 980,
      latency: 132,
      errors: 8,
      status: {
        '2xx': 945,
        '4xx': 27,
        '5xx': 8,
      },
    },
  ];

  // Sample API endpoints
  const endpoints: APIEndpoint[] = [
    {
      path: '/api/v1/logs',
      method: 'POST',
      version: 'v1',
      auth: true,
      rateLimit: {
        requests: 1000,
        period: 'hour',
      },
      cache: {
        enabled: false,
        ttl: 0,
      },
    },
    {
      path: '/api/v1/metrics',
      method: 'GET',
      version: 'v1',
      auth: true,
      rateLimit: {
        requests: 100,
        period: 'minute',
      },
      cache: {
        enabled: true,
        ttl: 300,
      },
    },
  ];

  const getStatusColor = (status: APIKey['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700';
      case 'inactive':
        return 'bg-yellow-50 text-yellow-700';
      case 'revoked':
        return 'bg-red-50 text-red-700';
      default:
        return '';
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    if (showKey.includes(keyId)) {
      setShowKey(showKey.filter(id => id !== keyId));
    } else {
      setShowKey([...showKey, keyId]);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">API Management</h1>
          <p className="text-muted-foreground">
            Manage API keys, monitor usage, and control access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key with custom permissions and rate limits
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Key Name</Label>
                    <Input placeholder="Enter key name" />
                  </div>
                  <div>
                    <Label>Environment</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch id="logs-read" />
                        <Label htmlFor="logs-read">Logs: Read</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="logs-write" />
                        <Label htmlFor="logs-write">Logs: Write</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="metrics-read" />
                        <Label htmlFor="metrics-read">Metrics: Read</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Rate Limit</Label>
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Requests" className="w-32" />
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minute">Per Minute</SelectItem>
                          <SelectItem value="hour">Per Hour</SelectItem>
                          <SelectItem value="day">Per Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateKeyOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateKeyOpen(false)}>
                  Create Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* API Keys */}
        <div className="col-span-12 space-y-4">
          <h2 className="text-xl font-semibold">API Keys</h2>
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{apiKey.name}</h3>
                      <Badge variant="outline" className={getStatusColor(apiKey.status)}>
                        {apiKey.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="font-mono bg-muted px-2 py-1 rounded">
                        {showKey.includes(apiKey.id) ? (
                          apiKey.key
                        ) : (
                          '•'.repeat(20)
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {showKey.includes(apiKey.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Rotate
                    </Button>
                    {apiKey.status === 'active' ? (
                      <Button variant="destructive" size="sm">
                        <Lock className="mr-2 h-4 w-4" />
                        Revoke
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Unlock className="mr-2 h-4 w-4" />
                        Activate
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Rate Limit</p>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>
                        {apiKey.rateLimit.requests}/{apiKey.rateLimit.period}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current Usage</p>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>
                        {apiKey.usage.current}/{apiKey.usage.limit}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Used</p>
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-purple-500" />
                      <span>
                        {apiKey.lastUsed
                          ? new Date(apiKey.lastUsed).toLocaleString()
                          : 'Never'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Reset Time</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>
                        {new Date(apiKey.usage.resetAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Environment: {apiKey.metadata.environment}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Created: {new Date(apiKey.created).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* API Metrics */}
        <div className="col-span-12 md:col-span-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">API Metrics</h2>
                <Select defaultValue="1h">
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
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Total Requests</p>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">2,230</span>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Avg Latency</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">138ms</span>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Error Rate</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="text-2xl font-bold">0.9%</span>
                  </div>
                </div>
              </div>
              <div className="aspect-[2/1] bg-muted rounded-lg flex items-center justify-center">
                <BarChart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints */}
        <div className="col-span-12 md:col-span-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg hover:bg-muted/80"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {endpoint.method}
                      </Badge>
                      <Badge variant="secondary">
                        v{endpoint.version}
                      </Badge>
                    </div>
                    <p className="font-mono text-sm mb-2">{endpoint.path}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {endpoint.auth && (
                        <div className="flex items-center gap-1">
                          <Lock className="h-4 w-4" />
                          <span>Auth Required</span>
                        </div>
                      )}
                      {endpoint.cache?.enabled && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Cache: {endpoint.cache.ttl}s</span>
                        </div>
                      )}
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

export default APIManager;
