import React from 'react';
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample data for demonstration
const logData = [
  {
    timestamp: "2024-01-28T10:00:00",
    level: "ERROR",
    service: "auth-service",
    message: "Failed to authenticate user",
    userId: "user123",
    errorCode: "AUTH001"
  },
  {
    timestamp: "2024-01-28T10:01:00",
    level: "INFO",
    service: "payment-service",
    message: "Payment processed successfully",
    userId: "user456",
    amount: 299.99
  },
  // Add more sample data...
];

const chartData = [
  { name: "00:00", errors: 4, warnings: 2, info: 15 },
  { name: "06:00", errors: 2, warnings: 5, info: 20 },
  { name: "12:00", errors: 6, warnings: 3, info: 18 },
  { name: "18:00", errors: 3, warnings: 4, info: 25 },
];

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Log Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <DatePickerWithRange />
          <Button>Export</Button>
          <Button variant="outline">Settings</Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Log Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="user">User Service</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Search logs..." />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Advanced Filters</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>User ID</DropdownMenuItem>
              <DropdownMenuItem>Error Code</DropdownMenuItem>
              <DropdownMenuItem>IP Address</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Logs</h3>
          <p className="text-2xl font-bold">24,521</p>
          <div className="text-sm text-green-600">+12.5% from last period</div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Error Rate</h3>
          <p className="text-2xl font-bold">2.4%</p>
          <div className="text-sm text-red-600">+0.8% from last period</div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Avg. Response Time</h3>
          <p className="text-2xl font-bold">245ms</p>
          <div className="text-sm text-green-600">-18ms from last period</div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Active Services</h3>
          <p className="text-2xl font-bold">12</p>
          <div className="text-sm text-muted-foreground">All systems operational</div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Log Volume Over Time</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="errors" stroke="#ff4d4f" />
                <Line type="monotone" dataKey="warnings" stroke="#faad14" />
                <Line type="monotone" dataKey="info" stroke="#1890ff" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Log Distribution by Service</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="errors" fill="#ff4d4f" />
                <Bar dataKey="warnings" fill="#faad14" />
                <Bar dataKey="info" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Log Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logData.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={log.level === "ERROR" ? "destructive" : 
                            log.level === "INFO" ? "default" : "warning"}
                  >
                    {log.level}
                  </Badge>
                </TableCell>
                <TableCell>{log.service}</TableCell>
                <TableCell className="max-w-md truncate">{log.message}</TableCell>
                <TableCell>{log.userId}</TableCell>
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

export default Dashboard;
