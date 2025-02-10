import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PlusCircle,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Settings,
  Box,
  RefreshCcw,
  Cloud,
  Bell,
  MessageSquare,
  Database,
  Shield,
} from 'lucide-react';

// Sample integration data
const integrations = [
  {
    id: 1,
    name: "AWS CloudWatch",
    category: "Cloud",
    status: "connected",
    lastSync: "2 mins ago",
    icon: "/aws-icon.png"
  },
  {
    id: 2,
    name: "Slack",
    category: "Communication",
    status: "connected",
    lastSync: "5 mins ago",
    icon: "/slack-icon.png"
  },
  {
    id: 3,
    name: "PagerDuty",
    category: "Alerts",
    status: "connected",
    lastSync: "1 min ago",
    icon: "/pagerduty-icon.png"
  }
];

// Sample webhooks
const webhooks = [
  {
    id: 1,
    name: "Production Alerts",
    url: "https://api.example.com/webhooks/prod",
    status: "active",
    events: ["error", "critical"],
    calls: 150
  },
  {
    id: 2,
    name: "Development Logs",
    url: "https://api.example.com/webhooks/dev",
    status: "active",
    events: ["all"],
    calls: 432
  }
];

const IntegrationCard = ({ name, description, icon, status }: any) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button variant={status === "connected" ? "outline" : "default"}>
        {status === "connected" ? "Configure" : "Connect"}
      </Button>
    </div>
  </Card>
);

const IntegrationHub = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">Connect and manage your tools and services</p>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Integration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-full">
              <LinkIcon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">12 Integrations</h3>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-full">
              <RefreshCcw className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">2.5M Events</h3>
              <p className="text-sm text-muted-foreground">Last 24h</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/10 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold">99.9% Uptime</h3>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/10 p-3 rounded-full">
              <Settings className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Auto-Sync</h3>
              <p className="text-sm text-muted-foreground">Enabled</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="cloud">Cloud Services</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IntegrationCard
              name="AWS CloudWatch"
              description="Sync logs and metrics from AWS services"
              icon={<Cloud className="h-6 w-6" />}
              status="connected"
            />
            <IntegrationCard
              name="Slack"
              description="Send notifications and alerts to channels"
              icon={<MessageSquare className="h-6 w-6" />}
              status="connected"
            />
            <IntegrationCard
              name="PagerDuty"
              description="Manage incidents and on-call schedules"
              icon={<Bell className="h-6 w-6" />}
              status="connected"
            />
            <IntegrationCard
              name="MongoDB Atlas"
              description="Monitor database metrics and logs"
              icon={<Database className="h-6 w-6" />}
              status="available"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Active Integrations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Integrations</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Integration</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Sync</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {integrations.map((integration) => (
              <TableRow key={integration.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    {integration.name}
                  </div>
                </TableCell>
                <TableCell>{integration.category}</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </TableCell>
                <TableCell>{integration.lastSync}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Configure</Button>
                    <Button variant="ghost" size="sm">Disconnect</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Webhooks */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Webhooks</h3>
            <p className="text-sm text-muted-foreground">Manage your webhook endpoints</p>
          </div>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Calls (24h)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell>{webhook.name}</TableCell>
                <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="secondary">{event}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{webhook.calls}</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Active</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Test</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* API Keys */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">API Configuration</h3>
            <p className="text-sm text-muted-foreground">Manage API keys and access</p>
          </div>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Generate Key
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label>Rate Limiting</Label>
              <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
            </div>
            <Input className="w-32" type="number" placeholder="100" />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label>IP Whitelist</Label>
              <p className="text-sm text-muted-foreground">Restrict API access by IP</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label>Webhook Retries</Label>
              <p className="text-sm text-muted-foreground">Auto-retry failed webhook calls</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IntegrationHub;
