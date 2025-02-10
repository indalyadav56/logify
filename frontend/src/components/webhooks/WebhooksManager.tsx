import  { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Play,
  Trash2,
  History,
  Brain,
  Zap,
  Search,
  Cpu,
  Shield,
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import AIPatternSuggestions from './AIPatternSuggestions';
import WebhookAnalytics from './WebhookAnalytics';
import WebhookTemplates from './WebhookTemplates';

interface WebhookTrigger {
  id: string;
  name: string;
  description: string;
  pattern: string;
  webhookUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  payload: string;
  active: boolean;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
  logSource: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryPolicy: 'none' | 'linear' | 'exponential';
  maxRetries: number;
}

const WebhooksManager = () => {
  const [webhooks, setWebhooks] = useState<WebhookTrigger[]>([
    {
      id: '1',
      name: 'Service Restart Trigger',
      description: 'Automatically restart service when memory usage exceeds threshold',
      pattern: 'memory usage > 90%',
      webhookUrl: 'https://api.example.com/restart-service',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      payload: JSON.stringify({
        action: 'restart',
        service: 'web-server'
      }, null, 2),
      active: true,
      lastTriggered: new Date(),
      successCount: 15,
      failureCount: 2,
      logSource: 'system-metrics',
      severity: 'high',
      retryPolicy: 'exponential',
      maxRetries: 3
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookTrigger | null>(null);

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(webhook => {
      if (webhook.id === id) {
        return { ...webhook, active: !webhook.active };
      }
      return webhook;
    }));
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
  };

  const testWebhook = (webhook: WebhookTrigger) => {
    // Implement webhook test logic
    console.log('Testing webhook:', webhook);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Webhooks & Triggers</h1>
          <p className="text-muted-foreground">Automate actions based on log patterns</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Webhook Trigger</DialogTitle>
              <DialogDescription>
                Set up a new webhook trigger to automate actions based on log patterns
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="trigger">Trigger Rules</TabsTrigger>
                <TabsTrigger value="action">Action</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="e.g., Service Restart Trigger" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe what this webhook does..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="trigger" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Log Source</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select log source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System Logs</SelectItem>
                        <SelectItem value="application">Application Logs</SelectItem>
                        <SelectItem value="security">Security Logs</SelectItem>
                        <SelectItem value="custom">Custom Source</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pattern Match</Label>
                    <Textarea placeholder="e.g., memory usage > 90% OR error.level = 'critical'" />
                    <p className="text-sm text-muted-foreground">
                      Use AND, OR operators and parentheses for complex patterns
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="action" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://api.example.com/webhook" />
                  </div>
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Headers</Label>
                    <Textarea
                      placeholder={`{
  "Content-Type": "application/json",
  "Authorization": "Bearer your-token"
}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payload Template</Label>
                    <Textarea
                      placeholder={`{
  "action": "restart",
  "service": "web-server",
  "trigger": {
    "pattern": "{{ pattern }}",
    "matched_log": "{{ log }}"
  }
}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Retry Policy</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select retry policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Retry</SelectItem>
                        <SelectItem value="linear">Linear Backoff</SelectItem>
                        <SelectItem value="exponential">Exponential Backoff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <div className="space-x-2">
                <Button variant="outline">Test</Button>
                <Button>Create Webhook</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="webhooks">Active Webhooks</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Active Webhooks</CardTitle>
              <CardDescription>
                Manage and monitor your webhook triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Pattern</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Success/Failure</TableHead>
                    <TableHead>Last Triggered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{webhook.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {webhook.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="p-1 rounded bg-muted text-sm">
                          {webhook.pattern}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            webhook.severity === 'critical' ? 'destructive' :
                            webhook.severity === 'high' ? 'default' :
                            'secondary'
                          }
                        >
                          {webhook.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">{webhook.successCount}</span>
                          <span>/</span>
                          <span className="text-red-500">{webhook.failureCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.lastTriggered?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={webhook.active}
                          onCheckedChange={() => toggleWebhook(webhook.id)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => testWebhook(webhook)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedWebhook(webhook)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <WebhookTemplates />
        </TabsContent>

        <TabsContent value="analytics">
          <WebhookAnalytics />
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIPatternSuggestions
              logSample=""
              onSelectPattern={(pattern) => {
                // Handle pattern selection
                console.log('Selected pattern:', pattern);
              }}
            />
            
            {/* AI-Powered Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>
                  Intelligent analysis of your webhook patterns and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* Performance Optimization */}
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-green-100 text-green-600">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">Performance Optimization</h4>
                        <p className="text-sm text-muted-foreground">
                          Consider implementing batch processing for high-frequency triggers.
                          This could reduce response time by up to 35%.
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Pattern Optimization */}
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <Search className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">Pattern Optimization</h4>
                        <p className="text-sm text-muted-foreground">
                          Your error detection patterns could be optimized by including
                          stack trace analysis. Estimated 25% reduction in false positives.
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Resource Usage */}
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">Resource Usage</h4>
                        <p className="text-sm text-muted-foreground">
                          Peak webhook activity detected between 2-4 PM UTC.
                          Consider distributing non-critical triggers to off-peak hours.
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Security Enhancement */}
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-red-100 text-red-600">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">Security Enhancement</h4>
                        <p className="text-sm text-muted-foreground">
                          Recommend implementing IP whitelisting for sensitive webhooks.
                          3 high-privilege webhooks currently accessible from any IP.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* History Dialog */}
      {selectedWebhook && (
        <Dialog open={!!selectedWebhook} onOpenChange={() => setSelectedWebhook(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Webhook History</DialogTitle>
              <DialogDescription>
                Recent trigger history for {selectedWebhook.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Today 14:23:05</div>
                  <Badge variant="default">Success</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Pattern matched: memory usage at 92%
                </div>
                <div className="text-sm">
                  Response: Service restarted successfully (200 OK)
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Today 12:15:30</div>
                  <Badge variant="destructive">Failed</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Pattern matched: memory usage at 95%
                </div>
                <div className="text-sm">
                  Error: Connection timeout (after 3 retries)
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WebhooksManager;
