import React from 'react';
import { Card } from "@/components/ui/card";
import { DatePickerWithRange } from "./DateRangePicker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Sample data
const timeSeriesData = [
  { time: '00:00', errors: 12, warnings: 24, info: 145 },
  { time: '04:00', errors: 8, warnings: 18, info: 156 },
  { time: '08:00', errors: 15, warnings: 30, info: 180 },
  { time: '12:00', errors: 25, warnings: 45, info: 210 },
  { time: '16:00', errors: 18, warnings: 28, info: 190 },
  { time: '20:00', errors: 10, warnings: 20, info: 160 },
];

const serviceDistribution = [
  { name: 'Auth Service', value: 30 },
  { name: 'Payment Service', value: 25 },
  { name: 'User Service', value: 20 },
  { name: 'API Gateway', value: 15 },
  { name: 'Notification Service', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const errorTypes = [
  { type: 'Authentication Failed', count: 45 },
  { type: 'Rate Limit Exceeded', count: 35 },
  { type: 'Invalid Input', count: 30 },
  { type: 'Database Error', count: 25 },
  { type: 'Network Timeout', count: 20 },
];

const Metrics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Metrics & Analytics</h1>
        <div className="flex items-center gap-4">
          <Select defaultValue="15m">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="1d">1 day</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange />
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Logs</h3>
          <p className="text-2xl font-bold">1,234,567</p>
          <p className="text-sm text-muted-foreground">+12.5% from last period</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Error Rate</h3>
          <p className="text-2xl font-bold">2.4%</p>
          <p className="text-sm text-red-500">+0.8% from last period</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Avg Response Time</h3>
          <p className="text-2xl font-bold">245ms</p>
          <p className="text-sm text-green-500">-18ms from last period</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Active Services</h3>
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">All systems operational</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Log Volume Over Time */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Log Volume Over Time</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="errors" stroke="#ff4d4f" name="Errors" />
                <Line type="monotone" dataKey="warnings" stroke="#faad14" name="Warnings" />
                <Line type="monotone" dataKey="info" stroke="#1890ff" name="Info" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Service Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Log Distribution by Service</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Error Types */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Error Types</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ff4d4f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="errors" 
                  stroke="#ff4d4f" 
                  name="Response Time (ms)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Metrics;
