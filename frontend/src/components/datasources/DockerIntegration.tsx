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
  Container,
  Settings,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Plus,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const DockerIntegration = () => {
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);

  const containers = [
    {
      id: 'c1',
      name: 'web-server',
      image: 'nginx:latest',
      status: 'running',
      cpu: '0.5%',
      memory: '128MB',
      logs: '2.3GB'
    },
    {
      id: 'c2',
      name: 'api-service',
      image: 'node:16',
      status: 'running',
      cpu: '1.2%',
      memory: '256MB',
      logs: '1.8GB'
    },
    {
      id: 'c3',
      name: 'database',
      image: 'postgres:14',
      status: 'running',
      cpu: '2.5%',
      memory: '512MB',
      logs: '5.1GB'
    }
  ];

  const logPatterns = [
    {
      name: 'Error Logs',
      pattern: 'level=(error|ERROR)',
      enabled: true
    },
    {
      name: 'Warning Logs',
      pattern: 'level=(warn|WARN)',
      enabled: true
    },
    {
      name: 'Access Logs',
      pattern: 'GET|POST|PUT|DELETE',
      enabled: true
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Docker Integration</h1>
          <p className="text-muted-foreground">
            Monitor and collect logs from Docker containers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Container
          </Button>
        </div>
      </div>

      <Tabs defaultValue="containers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="filters">Log Filters</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="containers">
          <Card>
            <CardHeader>
              <CardTitle>Container Management</CardTitle>
              <CardDescription>
                Monitor and manage Docker containers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search containers..."
                      className="w-full"
                      type="search"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="stopped">Stopped</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input type="checkbox" />
                      </TableHead>
                      <TableHead>Container</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>Memory</TableHead>
                      <TableHead>Log Size</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {containers.map((container) => (
                      <TableRow key={container.id}>
                        <TableCell>
                          <input type="checkbox" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Container className="h-4 w-4" />
                            {container.name}
                          </div>
                        </TableCell>
                        <TableCell>{container.image}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50">
                            {container.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{container.cpu}</TableCell>
                        <TableCell>{container.memory}</TableCell>
                        <TableCell>{container.logs}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Pause className="h-4 w-4" />
                            </Button>
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
              <CardTitle>Docker Configuration</CardTitle>
              <CardDescription>
                Configure Docker integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Docker Host</Label>
                    <Input placeholder="unix:///var/run/docker.sock" />
                  </div>
                  <div className="space-y-2">
                    <Label>API Version</Label>
                    <Input placeholder="v1.41" />
                  </div>
                  <div className="space-y-2">
                    <Label>TLS Certificate</Label>
                    <Input type="file" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-discover containers</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically detect and monitor new containers
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Collect container metrics</Label>
                      <p className="text-sm text-muted-foreground">
                        Gather CPU, memory, and network metrics
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable log rotation</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically rotate and compress old logs
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters">
          <Card>
            <CardHeader>
              <CardTitle>Log Filters</CardTitle>
              <CardDescription>
                Configure log filtering and processing rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Filter
                </Button>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filter Name</TableHead>
                      <TableHead>Pattern</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logPatterns.map((pattern, index) => (
                      <TableRow key={index}>
                        <TableCell>{pattern.name}</TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded">
                            {pattern.pattern}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Switch checked={pattern.enabled} />
                        </TableCell>
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

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Container Metrics</CardTitle>
                <CardDescription>
                  Resource usage and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {containers.map((container) => (
                    <div key={container.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{container.name}</span>
                        <Badge variant="outline">{container.status}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>CPU Usage</span>
                          <span>{container.cpu}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: container.cpu }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Memory Usage</span>
                          <span>{container.memory}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: '60%' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Log Statistics</CardTitle>
                <CardDescription>
                  Log volume and processing metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Logs</p>
                      <p className="text-2xl font-bold">9.2 GB</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Log Rate</p>
                      <p className="text-2xl font-bold">2.3 MB/s</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Containers</p>
                      <p className="text-2xl font-bold">8 / 12</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Error Rate</p>
                      <p className="text-2xl font-bold">0.05%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Usage</span>
                      <span>76%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '76%' }} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      7.6 GB used of 10 GB allocated
                    </p>
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

export default DockerIntegration;
