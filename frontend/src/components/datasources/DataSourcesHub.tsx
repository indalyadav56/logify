import { useNavigate } from 'react-router-dom';
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
  Cloud,
  Database,
  Box,
  FileText,
  GitBranch,
  Webhook,
  MessageSquare,
  Layers,
  Network,
  Activity,
  Plus,
} from 'lucide-react';

const DataSourcesHub = () => {
  const navigate = useNavigate();

  const dataSources = [
    {
      id: 'aws',
      name: 'AWS Services',
      description: 'Collect logs from various AWS services',
      icon: <Cloud className="h-6 w-6" />,
      category: 'Cloud',
      status: 'Popular',
      route: '/datasources/aws',
      services: ['S3', 'CloudWatch', 'Lambda', 'ECS', 'EKS']
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      description: 'Monitor Kubernetes clusters and workloads',
      icon: <Box className="h-6 w-6" />,
      category: 'Container',
      status: 'Enterprise',
      route: '/datasources/kubernetes',
      services: ['Pods', 'Services', 'Deployments', 'StatefulSets']
    },
    {
      id: 'docker',
      name: 'Docker',
      description: 'Collect logs from Docker containers',
      icon: <Box className="h-6 w-6" />,
      category: 'Container',
      status: 'Popular',
      route: '/datasources/docker',
      services: ['Containers', 'Volumes', 'Networks']
    },
    {
      id: 'database',
      name: 'Databases',
      description: 'Monitor database logs and metrics',
      icon: <Database className="h-6 w-6" />,
      category: 'Database',
      status: 'New',
      route: '/datasources/databases',
      services: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis']
    },
    {
      id: 'files',
      name: 'Log Files',
      description: 'Import logs from files and directories',
      icon: <FileText className="h-6 w-6" />,
      category: 'Files',
      status: 'Basic',
      route: '/datasources/files',
      services: ['Text Logs', 'JSON Logs', 'Syslog', 'Custom Formats']
    },
    {
      id: 'git',
      name: 'Git Repositories',
      description: 'Track logs from Git repositories',
      icon: <GitBranch className="h-6 w-6" />,
      category: 'Version Control',
      status: 'New',
      route: '/datasources/git',
      services: ['GitHub', 'GitLab', 'Bitbucket']
    },
    {
      id: 'api',
      name: 'API Endpoints',
      description: 'Collect logs from REST APIs',
      icon: <Webhook className="h-6 w-6" />,
      category: 'API',
      status: 'Popular',
      route: '/datasources/api',
      services: ['REST', 'GraphQL', 'WebSocket']
    },
    {
      id: 'messaging',
      name: 'Message Queues',
      description: 'Monitor messaging systems',
      icon: <MessageSquare className="h-6 w-6" />,
      category: 'Messaging',
      status: 'Enterprise',
      route: '/datasources/messaging',
      services: ['Kafka', 'RabbitMQ', 'Redis Pub/Sub']
    },
    {
      id: 'azure',
      name: 'Azure Services',
      description: 'Integration with Microsoft Azure',
      icon: <Cloud className="h-6 w-6" />,
      category: 'Cloud',
      status: 'Enterprise',
      route: '/datasources/azure',
      services: ['App Service', 'Functions', 'AKS', 'Storage']
    },
    {
      id: 'gcp',
      name: 'Google Cloud',
      description: 'Monitor Google Cloud Platform',
      icon: <Cloud className="h-6 w-6" />,
      category: 'Cloud',
      status: 'Enterprise',
      route: '/datasources/gcp',
      services: ['GKE', 'Cloud Run', 'Cloud Functions']
    },
    {
      id: 'serverless',
      name: 'Serverless',
      description: 'Track serverless function logs',
      icon: <Layers className="h-6 w-6" />,
      category: 'Serverless',
      status: 'New',
      route: '/datasources/serverless',
      services: ['AWS Lambda', 'Azure Functions', 'Cloud Functions']
    },
    {
      id: 'network',
      name: 'Network Devices',
      description: 'Monitor network infrastructure',
      icon: <Network className="h-6 w-6" />,
      category: 'Infrastructure',
      status: 'Enterprise',
      route: '/datasources/network',
      services: ['Routers', 'Switches', 'Load Balancers']
    }
  ];

  const categories = [
    'All',
    'Cloud',
    'Container',
    'Database',
    'Files',
    'Version Control',
    'API',
    'Messaging',
    'Serverless',
    'Infrastructure'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Data Sources</h1>
          <p className="text-muted-foreground">
            Connect and collect logs from various sources
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Data Source
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === 'All' ? 'default' : 'outline'}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataSources.map((source) => (
          <Card
            key={source.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(source.route)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {source.icon}
                  </div>
                  <div>
                    <CardTitle>{source.name}</CardTitle>
                    <CardDescription>{source.description}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    source.status === 'Popular'
                      ? 'bg-green-50'
                      : source.status === 'Enterprise'
                      ? 'bg-purple-50'
                      : source.status === 'New'
                      ? 'bg-blue-50'
                      : ''
                  }
                >
                  {source.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {source.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(source.route);
                  }}
                >
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Setup Guide */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
          <CardDescription>
            Follow these steps to get started with data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Box className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-medium">1. Choose Source</h4>
                <p className="text-sm text-muted-foreground">
                  Select a data source from the available integrations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-medium">2. Configure</h4>
                <p className="text-sm text-muted-foreground">
                  Set up authentication and customize settings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-medium">3. Monitor</h4>
                <p className="text-sm text-muted-foreground">
                  Start collecting and analyzing your logs
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSourcesHub;
