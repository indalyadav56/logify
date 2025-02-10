import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Plus,
  Settings,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Key,
  MessageSquare,
  Bell,
  Database,
  Cloud,
  Search,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Integration {
  id: string;
  name: string;
  type: 'notification' | 'monitoring' | 'storage' | 'analytics' | 'security';
  provider: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
  config: {
    apiKey?: string;
    webhook?: string;
    endpoint?: string;
    options?: Record<string, unknown>;
  };
  features: string[];
  metrics?: {
    requests: number;
    errors: number;
    latency: number;
  };
}

const IntegrationHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  // Sample integrations data
  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Slack Notifications',
      type: 'notification',
      provider: 'Slack',
      description: 'Send alerts and notifications to Slack channels',
      status: 'active',
      lastSync: '2025-01-31T05:30:00',
      config: {
        webhook: 'https://hooks.slack.com/services/xxx',
        options: {
          defaultChannel: '#alerts',
        },
      },
      features: ['Alert notifications', 'Report sharing', 'Custom templates'],
      metrics: {
        requests: 1205,
        errors: 2,
        latency: 245,
      },
    },
    {
      id: '2',
      name: 'AWS CloudWatch',
      type: 'monitoring',
      provider: 'AWS',
      description: 'Monitor AWS resources and collect metrics',
      status: 'active',
      lastSync: '2025-01-31T05:29:00',
      config: {
        apiKey: '****',
        endpoint: 'https://monitoring.aws.com',
      },
      features: ['Metric collection', 'Log aggregation', 'Resource monitoring'],
      metrics: {
        requests: 5420,
        errors: 12,
        latency: 180,
      },
    },
  ];

  const getIntegrationIcon = (type: Integration['type']) => {
    switch (type) {
      case 'notification':
        return <Bell className="h-5 w-5" />;
      case 'monitoring':
        return <AlertTriangle className="h-5 w-5" />;
      case 'storage':
        return <Database className="h-5 w-5" />;
      case 'analytics':
        return <MessageSquare className="h-5 w-5" />;
      case 'security':
        return <Key className="h-5 w-5" />;
      default:
        return <Cloud className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700';
      case 'inactive':
        return 'bg-yellow-50 text-yellow-700';
      case 'error':
        return 'bg-red-50 text-red-700';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">
            Connect and manage your third-party integrations
          </p>
        </div>
        <Dialog open={isConfigureOpen} onOpenChange={setIsConfigureOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Integration</DialogTitle>
              <DialogDescription>
                Set up a new integration with your preferred service
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div>
                  <Label>Integration Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select integration type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Provider</Label>
                  <Input placeholder="Enter provider name" />
                </div>
                <div>
                  <Label>API Key</Label>
                  <Input type="password" placeholder="Enter API key" />
                </div>
                <div>
                  <Label>Webhook URL (Optional)</Label>
                  <Input placeholder="Enter webhook URL" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigureOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsConfigureOpen(false)}>
                Save Integration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort
        </Button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-primary/10`}>
                  {getIntegrationIcon(integration.type)}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{integration.name}</h3>
                        <Badge
                          variant="outline"
                          className={getStatusColor(integration.status)}
                        >
                          {integration.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {integration.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {integration.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {integration.metrics && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Requests</p>
                          <p className="text-lg font-medium">
                            {integration.metrics.requests}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Errors</p>
                          <p className="text-lg font-medium">
                            {integration.metrics.errors}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Latency</p>
                          <p className="text-lg font-medium">
                            {integration.metrics.latency}ms
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Last sync: {new Date(integration.lastSync!).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </Button>
                        <Switch
                          checked={integration.status === 'active'}
                          onCheckedChange={() => {}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationHub;
