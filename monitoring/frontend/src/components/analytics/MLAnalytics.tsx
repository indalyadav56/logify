import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Filter,
  Settings,
  RefreshCw,
  Zap,
  Network,
  GitBranch,
  Fingerprint,
  Timer,
  Activity,
  ArrowUpDown,
  Plus,
} from 'lucide-react';

interface MLModel {
  id: string;
  name: string;
  type: 'anomaly' | 'prediction' | 'classification' | 'clustering';
  status: 'training' | 'active' | 'failed' | 'inactive';
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  lastTrained: string;
  predictions: number;
  trainingTime: number;
  features: string[];
}

interface Prediction {
  id: string;
  modelId: string;
  timestamp: string;
  input: Record<string, unknown>;
  output: {
    prediction: string | number;
    confidence: number;
    alternatives?: Array<{
      value: string | number;
      confidence: number;
    }>;
  };
  actual?: string | number;
  metadata: {
    duration: number;
    version: string;
  };
}

const MLAnalytics = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);

  // Sample ML models
  const mlModels: MLModel[] = [
    {
      id: '1',
      name: 'Log Anomaly Detector',
      type: 'anomaly',
      status: 'active',
      metrics: {
        accuracy: 0.95,
        precision: 0.92,
        recall: 0.89,
        f1Score: 0.90,
      },
      lastTrained: '2025-01-31T04:30:00',
      predictions: 15420,
      trainingTime: 1800,
      features: ['timestamp', 'log_level', 'message', 'source', 'context'],
    },
    {
      id: '2',
      name: 'Error Predictor',
      type: 'prediction',
      status: 'training',
      metrics: {
        accuracy: 0.88,
        precision: 0.85,
        recall: 0.82,
        f1Score: 0.83,
      },
      lastTrained: '2025-01-31T03:15:00',
      predictions: 8750,
      trainingTime: 2400,
      features: ['error_rate', 'response_time', 'cpu_usage', 'memory_usage'],
    },
  ];

  // Sample predictions
  const predictions: Prediction[] = [
    {
      id: '1',
      modelId: '1',
      timestamp: '2025-01-31T05:45:00',
      input: {
        log_level: 'ERROR',
        message: 'Connection timeout',
        source: 'api_gateway',
      },
      output: {
        prediction: 'anomaly',
        confidence: 0.95,
        alternatives: [
          { value: 'normal', confidence: 0.05 },
        ],
      },
      metadata: {
        duration: 45,
        version: '1.0.0',
      },
    },
    {
      id: '2',
      modelId: '2',
      timestamp: '2025-01-31T05:30:00',
      input: {
        error_rate: 0.02,
        response_time: 250,
        cpu_usage: 75,
      },
      output: {
        prediction: 0.85,
        confidence: 0.92,
      },
      actual: 0.82,
      metadata: {
        duration: 38,
        version: '1.0.0',
      },
    },
  ];

  const getModelTypeIcon = (type: MLModel['type']) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5" />;
      case 'prediction':
        return <TrendingUp className="h-5 w-5" />;
      case 'classification':
        return <GitBranch className="h-5 w-5" />;
      case 'clustering':
        return <Network className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: MLModel['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700';
      case 'training':
        return 'bg-blue-50 text-blue-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
      case 'inactive':
        return 'bg-gray-50 text-gray-700';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Machine Learning Analytics</h1>
          <p className="text-muted-foreground">
            Train and manage ML models for advanced log analysis
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
          <Dialog open={isTrainingOpen} onOpenChange={setIsTrainingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Train New Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Train New ML Model</DialogTitle>
                <DialogDescription>
                  Configure and train a new machine learning model
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Model Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anomaly">Anomaly Detection</SelectItem>
                        <SelectItem value="prediction">Prediction</SelectItem>
                        <SelectItem value="classification">Classification</SelectItem>
                        <SelectItem value="clustering">Clustering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Model Name</Label>
                    <Input placeholder="Enter model name" />
                  </div>
                  <div>
                    <Label>Features</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select features" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="log_level">Log Level</SelectItem>
                        <SelectItem value="timestamp">Timestamp</SelectItem>
                        <SelectItem value="message">Message</SelectItem>
                        <SelectItem value="source">Source</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Training Data</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logs">Log Data</SelectItem>
                        <SelectItem value="metrics">Metrics Data</SelectItem>
                        <SelectItem value="events">Event Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTrainingOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsTrainingOpen(false)}>
                  Start Training
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ML Models */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">ML Models</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mlModels.map((model) => (
            <Card key={model.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-primary/10`}>
                    {getModelTypeIcon(model.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{model.name}</h3>
                        <Badge
                          variant="outline"
                          className={getStatusColor(model.status)}
                        >
                          {model.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            {(model.metrics.accuracy * 100).toFixed(1)}%
                          </span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Predictions</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            {model.predictions.toLocaleString()}
                          </span>
                          <Activity className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {model.features.map((feature) => (
                          <Badge key={feature} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Training: {model.trainingTime}s
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Last: {new Date(model.lastTrained).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">
                          Retrain
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Predictions</h2>
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <Card key={prediction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {mlModels.find((m) => m.id === prediction.modelId)?.name}
                        </h3>
                        <Badge variant="outline">
                          {(prediction.output.confidence * 100).toFixed(1)}% confident
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(prediction.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium mb-2">Input Data</p>
                        <div className="space-y-2">
                          {Object.entries(prediction.input).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Prediction</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Result:</span>
                            <span className="font-medium">
                              {prediction.output.prediction}
                            </span>
                          </div>
                          {prediction.actual && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Actual:</span>
                              <span className="font-medium">{prediction.actual}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {prediction.output.alternatives && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Alternative Predictions</p>
                        <div className="flex gap-2">
                          {prediction.output.alternatives.map((alt, index) => (
                            <Badge key={index} variant="secondary">
                              {alt.value} ({(alt.confidence * 100).toFixed(1)}%)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Duration: {prediction.metadata.duration}ms
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Fingerprint className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Version: {prediction.metadata.version}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MLAnalytics;
