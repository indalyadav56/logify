import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";

// Sample alert rules
const alertRules = [
  {
    id: "1",
    name: "High Error Rate",
    condition: "error_rate > 5%",
    service: "all",
    severity: "critical",
    enabled: true,
    actions: ["email", "slack"],
    lastTriggered: "2024-01-28T15:30:00",
  },
  {
    id: "2",
    name: "API Latency Alert",
    condition: "response_time > 1000ms",
    service: "api-gateway",
    severity: "warning",
    enabled: true,
    actions: ["email"],
    lastTriggered: null,
  },
];

// Sample alert history
const alertHistory = [
  {
    id: "1",
    ruleName: "High Error Rate",
    timestamp: "2024-01-28T15:30:00",
    severity: "critical",
    message: "Error rate reached 7.5%",
    status: "resolved",
  },
  {
    id: "2",
    ruleName: "High Error Rate",
    timestamp: "2024-01-28T14:30:00",
    severity: "critical",
    message: "Error rate reached 6.2%",
    status: "active",
  },
];

const Alerts = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alert Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Alert Rule</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Alert Rule</DialogTitle>
              <DialogDescription>
                Configure a new alert rule to monitor your logs
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input id="name" placeholder="e.g., High Error Rate Alert" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="service">Service</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="api">API Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="condition">Condition</Label>
                <Textarea 
                  id="condition" 
                  placeholder="e.g., error_count > 100 OR response_time > 1000"
                  className="font-mono"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="severity">Severity</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Notification Channels</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="email" />
                    <Label htmlFor="email">Email</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="slack" />
                    <Label htmlFor="slack">Slack</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="webhook" />
                    <Label htmlFor="webhook">Webhook</Label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Create Alert Rule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Rules */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Alert Rules</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Triggered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alertRules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>{rule.name}</TableCell>
                <TableCell>{rule.service}</TableCell>
                <TableCell className="font-mono text-sm">{rule.condition}</TableCell>
                <TableCell>
                  <Badge
                    variant={rule.severity === "critical" ? "destructive" : 
                            rule.severity === "warning" ? "warning" : "default"}
                  >
                    {rule.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch checked={rule.enabled} />
                </TableCell>
                <TableCell>
                  {rule.lastTriggered ? 
                    new Date(rule.lastTriggered).toLocaleString() : 
                    "Never"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Alert History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Alert History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Rule Name</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alertHistory.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                <TableCell>{alert.ruleName}</TableCell>
                <TableCell>
                  <Badge
                    variant={alert.severity === "critical" ? "destructive" : 
                            alert.severity === "warning" ? "warning" : "default"}
                  >
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell>{alert.message}</TableCell>
                <TableCell>
                  <Badge
                    variant={alert.status === "active" ? "destructive" : "default"}
                  >
                    {alert.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Alerts;
