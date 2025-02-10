import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Brain,
  TrendingUp,
  AlertTriangle,
  Shield,
  Search,
  Zap,
  LineChart,
  Network,
  GitBranch,
  Bug,
  Timer,
  Cpu,
  Database,
  RefreshCw,
  Filter,
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'anomaly' | 'prediction' | 'correlation' | 'pattern' | 'security' | 'performance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  confidence: number;
  source: string;
  relatedMetrics: string[];
  recommendations: string[];
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
}

const AIInsightsDashboard = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Sample insights data
  const insights: AIInsight[] = [
    {
      id: '1',
      type: 'anomaly',
      title: 'Unusual Error Rate Spike',
      description: 'Detected a 300% increase in API authentication failures in the last hour',
      severity: 'critical',
      timestamp: '2025-01-31T05:30:00',
      confidence: 98,
      source: 'API Gateway',
      relatedMetrics: ['error_rate', 'auth_failures', 'request_latency'],
      recommendations: [
        'Check API authentication service',
        'Review recent deployments',
        'Monitor user session patterns'
      ],
      status: 'new'
    },
    {
      id: '2',
      type: 'prediction',
      title: 'Resource Exhaustion Risk',
      description: 'Predicted memory usage will exceed 90% capacity within 4 hours',
      severity: 'high',
      timestamp: '2025-01-31T05:15:00',
      confidence: 85,
      source: 'Resource Monitor',
      relatedMetrics: ['memory_usage', 'cpu_load', 'swap_usage'],
      recommendations: [
        'Scale up memory resources',
        'Optimize memory-intensive operations',
        'Review memory leak possibilities'
      ],
      status: 'investigating'
    },
    {
      id: '3',
      type: 'security',
      title: 'Potential Security Breach',
      description: 'Multiple failed login attempts from unusual IP addresses',
      severity: 'critical',
      timestamp: '2025-01-31T05:00:00',
      confidence: 92,
      source: 'Security Monitor',
      relatedMetrics: ['login_attempts', 'ip_blacklist_hits', 'auth_logs'],
      recommendations: [
        'Review security logs',
        'Update firewall rules',
        'Enable additional authentication factors'
      ],
      status: 'investigating'
    },
  ];

  const getTypeIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5" />;
      case 'prediction':
        return <TrendingUp className="h-5 w-5" />;
      case 'correlation':
        return <GitBranch className="h-5 w-5" />;
      case 'pattern':
        return <Network className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'performance':
        return <Timer className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">
            Real-time AI-powered analysis and recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
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
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Insights
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Issues
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI Confidence
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              Average prediction accuracy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolution Time
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18m</div>
            <p className="text-xs text-muted-foreground">
              Average time to resolve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${getSeverityColor(insight.severity)}`}>
                  {getTypeIcon(insight.type)}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{insight.title}</h3>
                        <Badge variant="outline" className={getSeverityColor(insight.severity)}>
                          {insight.severity}
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(insight.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-1 text-muted-foreground">{insight.description}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Related Metrics</p>
                      <div className="flex flex-wrap gap-2">
                        {insight.relatedMetrics.map((metric) => (
                          <Badge key={metric} variant="secondary">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Recommendations</p>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {insight.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Source: {insight.source}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                        <Button size="sm">
                          Take Action
                        </Button>
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

export default AIInsightsDashboard;
