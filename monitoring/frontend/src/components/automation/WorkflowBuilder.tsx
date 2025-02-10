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
  GitBranch,
  Play,
  Pause,
  Settings,
  Plus,
  History,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Zap,
  RefreshCw,
  AlertTriangle,
  BarChart,
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  type: 'scheduled' | 'event-driven' | 'manual';
  trigger: {
    type: 'schedule' | 'event' | 'api';
    config: {
      schedule?: string;
      event?: string;
      endpoint?: string;
    };
  };
  steps: WorkflowStep[];
  metrics: {
    runs: number;
    success: number;
    failed: number;
    avgDuration: number;
  };
  lastRun?: {
    status: 'success' | 'failed' | 'running';
    startTime: string;
    duration: number;
    error?: string;
  };
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'transformation';
  config: {
    action?: string;
    condition?: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
  };
  status: 'pending' | 'success' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  nextSteps: string[];
}

interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'success' | 'failed' | 'running';
  startTime: string;
  endTime?: string;
  duration: number;
  steps: {
    id: string;
    status: 'success' | 'failed' | 'running' | 'pending';
    startTime: string;
    endTime?: string;
    output?: unknown;
    error?: string;
  }[];
}

const WorkflowBuilder = () => {
  const [timeRange, setTimeRange] = useState('24h');

  // Sample workflows
  const workflows: Workflow[] = [
    {
      id: '1',
      name: 'Log Processing Pipeline',
      description: 'Process and analyze incoming log data',
      status: 'active',
      type: 'event-driven',
      trigger: {
        type: 'event',
        config: {
          event: 'log.received',
        },
      },
      steps: [
        {
          id: 's1',
          name: 'Parse Log Data',
          type: 'transformation',
          config: {
            input: {
              format: 'raw',
            },
            output: {
              format: 'json',
            },
          },
          status: 'success',
          duration: 125,
          nextSteps: ['s2'],
        },
        {
          id: 's2',
          name: 'Check Error Level',
          type: 'condition',
          config: {
            condition: 'level === "error"',
          },
          status: 'success',
          duration: 45,
          nextSteps: ['s3', 's4'],
        },
        {
          id: 's3',
          name: 'Send Alert',
          type: 'action',
          config: {
            action: 'sendAlert',
            input: {
              channel: 'slack',
              priority: 'high',
            },
          },
          status: 'success',
          duration: 350,
          nextSteps: [],
        },
        {
          id: 's4',
          name: 'Store Log',
          type: 'action',
          config: {
            action: 'storeLog',
            input: {
              database: 'logs',
              retention: '30d',
            },
          },
          status: 'success',
          duration: 280,
          nextSteps: [],
        },
      ],
      metrics: {
        runs: 1250,
        success: 1180,
        failed: 70,
        avgDuration: 800,
      },
      lastRun: {
        status: 'success',
        startTime: '2025-01-31T05:45:00',
        duration: 785,
      },
    },
    {
      id: '2',
      name: 'Daily Metrics Aggregation',
      description: 'Aggregate and report daily metrics',
      status: 'active',
      type: 'scheduled',
      trigger: {
        type: 'schedule',
        config: {
          schedule: '0 0 * * *',
        },
      },
      steps: [
        {
          id: 's1',
          name: 'Fetch Metrics',
          type: 'action',
          config: {
            action: 'fetchMetrics',
            input: {
              period: '24h',
            },
          },
          status: 'success',
          duration: 450,
          nextSteps: ['s2'],
        },
        {
          id: 's2',
          name: 'Aggregate Data',
          type: 'transformation',
          config: {
            input: {
              format: 'raw',
            },
            output: {
              format: 'aggregated',
            },
          },
          status: 'success',
          duration: 680,
          nextSteps: ['s3'],
        },
        {
          id: 's3',
          name: 'Generate Report',
          type: 'action',
          config: {
            action: 'generateReport',
            input: {
              template: 'daily',
              format: 'pdf',
            },
          },
          status: 'success',
          duration: 890,
          nextSteps: ['s4'],
        },
        {
          id: 's4',
          name: 'Send Report',
          type: 'action',
          config: {
            action: 'sendEmail',
            input: {
              recipients: ['team@company.com'],
              subject: 'Daily Metrics Report',
            },
          },
          status: 'success',
          duration: 240,
          nextSteps: [],
        },
      ],
      metrics: {
        runs: 180,
        success: 175,
        failed: 5,
        avgDuration: 2260,
      },
      lastRun: {
        status: 'success',
        startTime: '2025-01-31T00:00:00',
        duration: 2245,
      },
    },
  ];

  // Sample workflow runs
  const workflowRuns: WorkflowRun[] = [
    {
      id: 'r1',
      workflowId: '1',
      status: 'success',
      startTime: '2025-01-31T05:45:00',
      endTime: '2025-01-31T05:46:25',
      duration: 785,
      steps: [
        {
          id: 's1',
          status: 'success',
          startTime: '2025-01-31T05:45:00',
          endTime: '2025-01-31T05:45:12',
          output: { format: 'json' },
        },
        {
          id: 's2',
          status: 'success',
          startTime: '2025-01-31T05:45:12',
          endTime: '2025-01-31T05:45:15',
        },
      ],
    },
    {
      id: 'r2',
      workflowId: '1',
      status: 'failed',
      startTime: '2025-01-31T05:30:00',
      endTime: '2025-01-31T05:31:45',
      duration: 905,
      steps: [
        {
          id: 's1',
          status: 'success',
          startTime: '2025-01-31T05:30:00',
          endTime: '2025-01-31T05:30:15',
        },
        {
          id: 's2',
          status: 'failed',
          startTime: '2025-01-31T05:30:15',
          endTime: '2025-01-31T05:30:45',
          error: 'Invalid log format',
        },
      ],
    },
  ];

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700';
      case 'paused':
        return 'bg-yellow-50 text-yellow-700';
      case 'draft':
        return 'bg-gray-50 text-gray-700';
      default:
        return '';
    }
  };

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'skipped':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'action':
        return <Zap className="h-4 w-4" />;
      case 'condition':
        return <GitBranch className="h-4 w-4" />;
      case 'transformation':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Workflow Builder</h1>
          <p className="text-muted-foreground">
            Create and manage automated workflows
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Workflows */}
        <div className="col-span-12 space-y-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{workflow.name}</h3>
                      <Badge variant="outline" className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <Badge variant="secondary">{workflow.type}</Badge>
                    </div>
                    <p className="text-muted-foreground">{workflow.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    {workflow.status === 'active' ? (
                      <Button variant="outline" size="sm">
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Activate
                      </Button>
                    )}
                    <Button size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Run Now
                    </Button>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div className="mt-6">
                  <div className="flex items-center gap-4">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        {index > 0 && (
                          <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                        )}
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          {getStepIcon(step.type)}
                          <span className="text-sm">{step.name}</span>
                          <Badge
                            variant="secondary"
                            className={getStepStatusColor(step.status)}
                          >
                            {step.duration}ms
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Metrics */}
                <div className="mt-6 grid grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Runs</p>
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-blue-500" />
                      <span className="text-xl font-bold">
                        {workflow.metrics.runs}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xl font-bold">
                        {((workflow.metrics.success / workflow.metrics.runs) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Failed Runs</p>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xl font-bold">
                        {workflow.metrics.failed}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Avg Duration</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="text-xl font-bold">
                        {workflow.metrics.avgDuration}ms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Last Run */}
                {workflow.lastRun && (
                  <div className="mt-4 flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Last run: {new Date(workflow.lastRun.startTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Duration: {workflow.lastRun.duration}ms
                        </span>
                      </div>
                      {workflow.lastRun.error && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-500">
                            {workflow.lastRun.error}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <History className="mr-2 h-4 w-4" />
                      View History
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workflow Analytics */}
        <div className="col-span-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Workflow Analytics</h2>
                <Select defaultValue="runs">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="runs">Total Runs</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="errors">Error Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="aspect-[2/1] bg-muted rounded-lg flex items-center justify-center">
                <BarChart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Runs */}
        <div className="col-span-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Runs</h2>
              <div className="space-y-4">
                {workflowRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-4 bg-muted rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {run.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : run.status === 'failed' ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <RefreshCw className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="font-medium">
                          Run #{run.id}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          run.status === 'success'
                            ? 'bg-green-50 text-green-700'
                            : run.status === 'failed'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                        }
                      >
                        {run.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Start Time</span>
                        <span>{new Date(run.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Duration</span>
                        <span>{run.duration}ms</span>
                      </div>
                    </div>
                    {run?.error && (
                      <div className="mt-2 text-sm text-red-500">
                        {run.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
