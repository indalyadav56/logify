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
import { Textarea } from "@/components/ui/textarea";
import {
  Wand2,
  Plus,
  Play,
  Pause,
  Clock,
  Settings,
  Trash,
  Copy,
  AlertTriangle,
  Mail,
  MessageSquare,
  Webhook,
  RefreshCw,
} from 'lucide-react';
import { Label } from '../ui/label';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  condition: {
    field: string;
    operator: string;
    value: string;
  }[];
  actions: {
    type: 'alert' | 'notification' | 'webhook' | 'transform' | 'tag' | 'forward';
    config: Record<string, unknown>;
  }[];
  status: 'active' | 'paused' | 'draft';
  schedule?: {
    type: 'realtime' | 'interval' | 'cron';
    value: string;
  };
  priority: 'low' | 'medium' | 'high';
  lastRun?: string;
  stats: {
    executionCount: number;
    avgExecutionTime: number;
    successRate: number;
  };
}

const AutomationRules = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Sample rules data
  const rules: AutomationRule[] = [
    {
      id: '1',
      name: 'Error Alert',
      description: 'Send alerts for critical errors',
      condition: [
        {
          field: 'level',
          operator: 'equals',
          value: 'error',
        },
        {
          field: 'service',
          operator: 'contains',
          value: 'api',
        },
      ],
      actions: [
        {
          type: 'alert',
          config: {
            channel: 'slack',
            severity: 'high',
          },
        },
        {
          type: 'notification',
          config: {
            recipients: ['team@example.com'],
            template: 'error_alert',
          },
        },
      ],
      status: 'active',
      schedule: {
        type: 'realtime',
        value: 'immediate',
      },
      priority: 'high',
      lastRun: '2025-01-31T05:30:00',
      stats: {
        executionCount: 156,
        avgExecutionTime: 245,
        successRate: 99.8,
      },
    },
    {
      id: '2',
      name: 'Log Enrichment',
      description: 'Add metadata to incoming logs',
      condition: [
        {
          field: 'source',
          operator: 'equals',
          value: 'production',
        },
      ],
      actions: [
        {
          type: 'transform',
          config: {
            addFields: {
              environment: 'production',
              region: 'us-west',
            },
          },
        },
      ],
      status: 'active',
      priority: 'medium',
      lastRun: '2025-01-31T05:29:00',
      stats: {
        executionCount: 1205,
        avgExecutionTime: 125,
        successRate: 100,
      },
    },
  ];

  const getActionIcon = (type: AutomationRule['actions'][0]['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'notification':
        return <Mail className="h-4 w-4" />;
      case 'webhook':
        return <Webhook className="h-4 w-4" />;
      case 'transform':
        return <Wand2 className="h-4 w-4" />;
      case 'tag':
        return <MessageSquare className="h-4 w-4" />;
      case 'forward':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Automation Rules</h1>
          <p className="text-muted-foreground">
            Create and manage automated log processing rules
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
              <DialogDescription>
                Define conditions and actions for automated log processing
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input placeholder="Enter rule name" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the purpose of this rule" />
                </div>
              </div>

              <div>
                <Label>Conditions</Label>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="level">Log Level</SelectItem>
                            <SelectItem value="message">Message</SelectItem>
                            <SelectItem value="source">Source</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="regex">Matches Regex</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Enter value" />
                      </div>
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Condition
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Label>Actions</Label>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alert">Send Alert</SelectItem>
                          <SelectItem value="notification">Send Notification</SelectItem>
                          <SelectItem value="webhook">Trigger Webhook</SelectItem>
                          <SelectItem value="transform">Transform Log</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Schedule</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="interval">Interval</SelectItem>
                      <SelectItem value="cron">Cron Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{rule.name}</h3>
                      <Badge
                        variant="outline"
                        className={
                          rule.status === 'active'
                            ? 'bg-green-50 text-green-700'
                            : rule.status === 'paused'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-gray-50 text-gray-700'
                        }
                      >
                        {rule.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          rule.priority === 'high'
                            ? 'bg-red-50 text-red-700'
                            : rule.priority === 'medium'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-green-50 text-green-700'
                        }
                      >
                        {rule.priority} priority
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      {rule.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Conditions</h4>
                    <div className="space-y-2">
                      {rule.condition.map((cond, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm p-2 bg-muted rounded-lg"
                        >
                          <Badge variant="outline">{cond.field}</Badge>
                          <span className="text-muted-foreground">{cond.operator}</span>
                          <Badge variant="secondary">{cond.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Actions</h4>
                    <div className="space-y-2">
                      {rule.actions.map((action, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm p-2 bg-muted rounded-lg"
                        >
                          {getActionIcon(action.type)}
                          <span className="capitalize">{action.type}</span>
                          {/* <Badge variant="secondary">
                            {Object.keys(action.config)[0]}:
                            {action.config[Object.keys(action.config)[0]]}
                          </Badge> */}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Last run: {new Date(rule.lastRun!).toLocaleString()}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {rule.stats.executionCount} executions
                    </Badge>
                    <Badge variant="secondary">
                      {rule.stats.avgExecutionTime}ms avg
                    </Badge>
                    <Badge variant="secondary">
                      {rule.stats.successRate}% success
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Schedule: {rule.schedule?.type}
                    </span>
                    <Badge variant="outline">{rule.schedule?.value}</Badge>
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

export default AutomationRules;
