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
  Bell,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Mail,
  MessageSquare,
  Smartphone,
  Slack,
  Webhook,
  Filter,
  Plus,
  Clock,
  RefreshCw,
  Archive,
  Trash2,
  MoreVertical,
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  source: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actions?: {
    label: string;
    action: string;
  }[];
  metadata?: Record<string, any>;
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    type: string;
    operator: string;
    value: any;
  }[];
  actions: {
    type: string;
    config: Record<string, any>;
  }[];
  enabled: boolean;
  schedule?: {
    type: 'immediate' | 'scheduled';
    interval?: string;
    timezone?: string;
  };
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'in-app';
  config: Record<string, any>;
  enabled: boolean;
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
}

const NotificationCenter = () => {
  const [filter, setFilter] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');

  // Sample notifications
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'High CPU Usage Detected',
      message: 'Server CPU usage has exceeded 90% threshold',
      type: 'warning',
      source: 'System Monitor',
      timestamp: '2025-01-31T06:15:00',
      read: false,
      priority: 'high',
      actions: [
        { label: 'View Details', action: 'view' },
        { label: 'Dismiss', action: 'dismiss' },
      ],
      metadata: {
        serverId: 'srv-001',
        cpuUsage: 92.5,
        threshold: 90,
      },
    },
    {
      id: '2',
      title: 'Backup Completed Successfully',
      message: 'Daily backup completed for all production databases',
      type: 'success',
      source: 'Backup Service',
      timestamp: '2025-01-31T06:00:00',
      read: true,
      priority: 'low',
      metadata: {
        backupSize: '2.5GB',
        duration: '15m',
        location: 's3://backups/',
      },
    },
  ];

  // Sample notification rules
  const notificationRules: NotificationRule[] = [
    {
      id: '1',
      name: 'High Resource Usage Alert',
      description: 'Alert when resource usage exceeds thresholds',
      conditions: [
        {
          type: 'cpu_usage',
          operator: 'gt',
          value: 90,
        },
        {
          type: 'memory_usage',
          operator: 'gt',
          value: 85,
        },
      ],
      actions: [
        {
          type: 'email',
          config: {
            template: 'resource_alert',
            recipients: ['admin@example.com'],
          },
        },
        {
          type: 'slack',
          config: {
            channel: '#alerts',
            mention: '@oncall',
          },
        },
      ],
      enabled: true,
      schedule: {
        type: 'immediate',
      },
    },
    {
      id: '2',
      name: 'Daily Performance Report',
      description: 'Send daily performance metrics report',
      conditions: [
        {
          type: 'schedule',
          operator: 'eq',
          value: '0 0 * * *',
        },
      ],
      actions: [
        {
          type: 'email',
          config: {
            template: 'daily_report',
            recipients: ['team@example.com'],
          },
        },
      ],
      enabled: true,
      schedule: {
        type: 'scheduled',
        interval: 'daily',
        timezone: 'UTC',
      },
    },
  ];

  // Sample notification channels
  const notificationChannels: NotificationChannel[] = [
    {
      id: '1',
      name: 'Team Email',
      type: 'email',
      config: {
        smtp_server: 'smtp.example.com',
        from_email: 'alerts@example.com',
        recipients: ['team@example.com'],
      },
      enabled: true,
      status: 'active',
      lastSync: '2025-01-31T06:00:00',
    },
    {
      id: '2',
      name: 'DevOps Slack',
      type: 'slack',
      config: {
        webhook_url: 'https://hooks.slack.com/...',
        default_channel: '#devops',
        username: 'AlertBot',
      },
      enabled: true,
      status: 'active',
      lastSync: '2025-01-31T06:15:00',
    },
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (type: NotificationChannel['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'slack':
        return <Slack className="h-4 w-4" />;
      case 'webhook':
        return <Webhook className="h-4 w-4" />;
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      case 'in-app':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notification Center</h1>
          <p className="text-muted-foreground">
            Manage alerts, notifications, and delivery channels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Delivery Channels</h2>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Channel
            </Button>
          </div>
          <div className="space-y-4">
            {notificationChannels.map((channel) => (
              <div
                key={channel.id}
                className="p-4 bg-muted rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-background rounded-md">
                    {getChannelIcon(channel.type)}
                  </div>
                  <div>
                    <h3 className="font-medium">{channel.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {channel.type.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={
                      channel.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : channel.status === 'error'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }
                  >
                    {channel.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Rules */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Alert Rules</h2>
            <div className="flex items-center gap-2">
              <Select
                defaultValue={selectedChannel}
                onValueChange={setSelectedChannel}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Rule
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {notificationRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 bg-muted rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{rule.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        rule.enabled
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-50 text-gray-700'
                      }
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Conditions</h4>
                    <div className="space-y-2">
                      {rule.conditions.map((condition, index) => (
                        <div
                          key={index}
                          className="text-sm flex items-center gap-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>
                            {condition.type} {condition.operator} {condition.value}
                          </span>
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
                          className="text-sm flex items-center gap-2"
                        >
                          {getChannelIcon(action.type as any)}
                          <span>{action.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Notifications</h2>
            <div className="flex items-center gap-2">
              <Select defaultValue={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read ? 'bg-muted' : 'bg-primary/5 border-primary'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{notification.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            notification.priority === 'high'
                              ? 'bg-red-50 text-red-700'
                              : notification.priority === 'medium'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-blue-50 text-blue-700'
                          }
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{notification.source}</span>
                        <span>•</span>
                        <span>
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.actions?.map((action) => (
                      <Button
                        key={action.label}
                        variant="ghost"
                        size="sm"
                      >
                        {action.label}
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {notification.metadata && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Details</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(notification.metadata).map(
                        ([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-muted-foreground">
                              {key}:{' '}
                            </span>
                            <span>{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" size="sm">
              <Archive className="mr-2 h-4 w-4" />
              Archive All
            </Button>
            <Button variant="outline" size="sm" className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
