import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Box,
  Settings,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Plus,
  Search,
  AlertCircle,
  Database,
  Server,
  Network,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const KubernetesIntegration = () => {
  const [selectedNamespace, setSelectedNamespace] = useState<string>('default');

  const pods = [
    {
      name: 'web-frontend-7d4f79f5b5-x8l2k',
      namespace: 'default',
      status: 'Running',
      containers: 2,
      restarts: 0,
      cpu: '150m',
      memory: '256Mi',
      age: '2d'
    },
    {
      name: 'api-backend-6c9f8b9d67-j4k2m',
      namespace: 'default',
      status: 'Running',
      containers: 1,
      restarts: 1,
      cpu: '200m',
      memory: '512Mi',
      age: '5d'
    },
    {
      name: 'redis-master-0',
      namespace: 'default',
      status: 'Running',
      containers: 1,
      restarts: 0,
      cpu: '100m',
      memory: '128Mi',
      age: '7d'
    }
  ];

  const namespaces = ['default', 'kube-system', 'monitoring', 'logging'];

  const clusterMetrics = {
    nodes: 3,
    pods: 24,
    services: 12,
    storage: '256GB',
    cpu: '75%',
    memory: '60%'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Kubernetes Integration</h1>
          <p className="text-muted-foreground">
            Monitor and collect logs from Kubernetes clusters
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Cluster
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Cluster Overview</TabsTrigger>
          <TabsTrigger value="pods">Pods</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cluster Status</CardTitle>
                <CardDescription>
                  Current state of the Kubernetes cluster
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Nodes</p>
                    <p className="text-2xl font-bold">{clusterMetrics.nodes}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Pods</p>
                    <p className="text-2xl font-bold">{clusterMetrics.pods}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Services</p>
                    <p className="text-2xl font-bold">{clusterMetrics.services}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <p className="text-2xl font-bold">{clusterMetrics.storage}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>{clusterMetrics.cpu}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: clusterMetrics.cpu }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>{clusterMetrics.memory}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: clusterMetrics.memory }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Distribution</CardTitle>
                <CardDescription>
                  Resource allocation across namespaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {namespaces.map((namespace) => (
                    <div key={namespace} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4" />
                          <span className="font-medium">{namespace}</span>
                        </div>
                        <Badge variant="outline">
                          {Math.floor(Math.random() * 10)} pods
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU Request</span>
                          <span>{Math.floor(Math.random() * 500)}m</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Memory Request</span>
                          <span>{Math.floor(Math.random() * 1024)}Mi</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pods">
          <Card>
            <CardHeader>
              <CardTitle>Pod Management</CardTitle>
              <CardDescription>
                Monitor and manage Kubernetes pods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search pods..."
                      className="w-full"
                      type="search"
                    />
                  </div>
                  <Select defaultValue={selectedNamespace}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Namespace" />
                    </SelectTrigger>
                    <SelectContent>
                      {namespaces.map((ns) => (
                        <SelectItem key={ns} value={ns}>
                          {ns}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Containers</TableHead>
                      <TableHead>Restarts</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>Memory</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pods.map((pod) => (
                      <TableRow key={pod.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Box className="h-4 w-4" />
                            <span className="font-mono text-sm">{pod.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={pod.status === 'Running' ? 'bg-green-50' : ''}
                          >
                            {pod.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{pod.containers}</TableCell>
                        <TableCell>{pod.restarts}</TableCell>
                        <TableCell>{pod.cpu}</TableCell>
                        <TableCell>{pod.memory}</TableCell>
                        <TableCell>{pod.age}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle>Cluster Configuration</CardTitle>
              <CardDescription>
                Configure Kubernetes integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cluster URL</Label>
                    <Input placeholder="https://kubernetes.default.svc" />
                  </div>
                  <div className="space-y-2">
                    <Label>Service Account Token</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Kubeconfig File</Label>
                    <Input type="file" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-discover resources</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically detect and monitor new resources
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Collect resource metrics</Label>
                      <p className="text-sm text-muted-foreground">
                        Gather detailed metrics using metrics-server
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable RBAC</Label>
                      <p className="text-sm text-muted-foreground">
                        Use role-based access control
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Node Health</CardTitle>
                <CardDescription>
                  Health status of cluster nodes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((node) => (
                    <div key={node} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          <span className="font-medium">node-{node}</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50">
                          Healthy
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>CPU</span>
                            <span>75%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: '75%' }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Memory</span>
                            <span>60%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: '60%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Traffic</CardTitle>
                <CardDescription>
                  Pod-to-pod network statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Ingress</p>
                      <p className="text-2xl font-bold">2.3 GB/s</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Egress</p>
                      <p className="text-2xl font-bold">1.8 GB/s</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Packets</p>
                      <p className="text-2xl font-bold">45K/s</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Errors</p>
                      <p className="text-2xl font-bold">0.01%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Top Network Paths</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Traffic</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>web-frontend</TableCell>
                          <TableCell>api-backend</TableCell>
                          <TableCell>1.2 GB/s</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>api-backend</TableCell>
                          <TableCell>redis-master</TableCell>
                          <TableCell>800 MB/s</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>monitoring</TableCell>
                          <TableCell>elasticsearch</TableCell>
                          <TableCell>300 MB/s</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KubernetesIntegration;
