import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Sparkles,
  LineChart,
  AlertCircle,
  Search,
  MessageSquare,
  BarChart2,
  Zap,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Sample data for charts
const anomalyData = [
  { time: '00:00', value: 45, threshold: 50 },
  { time: '04:00', value: 48, threshold: 50 },
  { time: '08:00', value: 52, threshold: 50 },
  { time: '12:00', value: 75, threshold: 50 },
  { time: '16:00', value: 48, threshold: 50 },
  { time: '20:00', value: 46, threshold: 50 },
];

const patternData = [
  { time: '00:00', actual: 30, predicted: 32 },
  { time: '04:00', actual: 35, predicted: 34 },
  { time: '08:00', actual: 45, predicted: 42 },
  { time: '12:00', actual: 55, predicted: 52 },
  { time: '16:00', actual: 40, predicted: 38 },
  { time: '20:00', actual: 35, predicted: 34 },
];

const AIAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI & Advanced Analytics</h1>
        <Button>
          <Sparkles className="h-4 w-4 mr-2" />
          Run Analysis
        </Button>
      </div>

      {/* AI Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/10 p-3 rounded-full">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">AI Insights</h3>
              <p className="text-sm text-muted-foreground">Active Learning</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-full">
              <LineChart className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Pattern Detection</h3>
              <p className="text-sm text-muted-foreground">Real-time</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-red-500/10 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold">Anomaly Detection</h3>
              <p className="text-sm text-muted-foreground">ML-powered</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Log Analysis</h3>
              <p className="text-sm text-muted-foreground">NLP-based</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Natural Language Query */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Natural Language Query</h3>
          </div>
          <div className="flex gap-4">
            <Input 
              className="flex-1" 
              placeholder="Ask questions about your logs, e.g., 'Show me error patterns in the last hour'"
            />
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="cursor-pointer">Show error trends</Badge>
            <Badge variant="secondary" className="cursor-pointer">Find unusual patterns</Badge>
            <Badge variant="secondary" className="cursor-pointer">Performance analysis</Badge>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Anomaly Detection */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Anomaly Detection</h3>
              <p className="text-sm text-muted-foreground">Real-time monitoring</p>
            </div>
            <Select defaultValue="errors">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="errors">Error Rate</SelectItem>
                <SelectItem value="latency">Latency</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={anomalyData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                <Line type="monotone" dataKey="threshold" stroke="#ff4d4f" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <Badge variant="destructive">Anomaly Detected</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Unusual spike in error rate detected at 12:00. 50% increase from baseline.
            </p>
          </div>
        </Card>

        {/* Pattern Recognition */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Pattern Recognition</h3>
              <p className="text-sm text-muted-foreground">ML-based prediction</p>
            </div>
            <Button variant="outline" size="sm">
              <BarChart2 className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={patternData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="#82ca9d" strokeDasharray="5 5" name="Predicted" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <Badge className="bg-green-500">Pattern Identified</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Regular traffic pattern detected with 94% confidence. Peak hours: 10:00-14:00.
            </p>
          </div>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
            <div className="bg-purple-500/10 p-2 rounded-full">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h4 className="font-medium">Optimize Error Handling</h4>
              <p className="text-sm text-muted-foreground mt-1">
                High frequency of timeout errors detected in the payment service. 
                Consider increasing the retry count and implementing circuit breaker pattern.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">High Priority</Badge>
                <Badge variant="outline">Performance</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
            <div className="bg-blue-500/10 p-2 rounded-full">
              <Brain className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium">Resource Scaling</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Based on traffic patterns, consider auto-scaling resources between 10:00-14:00 
                to maintain optimal performance during peak hours.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Medium Priority</Badge>
                <Badge variant="outline">Infrastructure</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
            <div className="bg-green-500/10 p-2 rounded-full">
              <LineChart className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium">Log Pattern Optimization</h4>
              <p className="text-sm text-muted-foreground mt-1">
                25% of logs contain redundant information. Implement structured logging 
                and reduce verbosity in development environments.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Low Priority</Badge>
                <Badge variant="outline">Optimization</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAnalytics;
