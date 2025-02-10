import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Cloud,
  FolderOpen,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Filter,
  Download,
  Trash2,
  Settings2,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

// Sample data for import history
const importHistory = [
  {
    id: 1,
    bucket: 'my-logs-bucket',
    path: 'prod/logs/2024/01/',
    status: 'completed',
    files: 156,
    size: '2.3 GB',
    timestamp: '2024-01-28 15:30:00',
  },
  {
    id: 2,
    bucket: 'my-logs-bucket',
    path: 'staging/logs/2024/01/',
    status: 'in_progress',
    files: 89,
    size: '1.1 GB',
    timestamp: '2024-01-28 15:45:00',
  },
];

const S3Import = () => {
  const [importing, setImporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const handleImport = () => {
    setImporting(true);
    setProgress(0);
    // Simulate import progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setImporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">S3 Log Import</h1>
          <p className="text-muted-foreground">Import and manage logs from Amazon S3</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Cloud className="mr-2 h-4 w-4" />
              Import from S3
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Import Logs from S3</DialogTitle>
              <DialogDescription>
                Configure S3 bucket and path to import logs
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>AWS Region</Label>
                <Select defaultValue="us-east-1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>S3 Bucket</Label>
                <Input placeholder="my-logs-bucket" />
              </div>
              <div className="space-y-2">
                <Label>S3 Path</Label>
                <Input placeholder="path/to/logs/" />
              </div>
              <div className="space-y-2">
                <Label>File Pattern</Label>
                <Input placeholder="*.log" />
                <p className="text-sm text-muted-foreground">
                  Use wildcards like *.log or specify exact filenames
                </p>
              </div>
              <Accordion type="single" collapsible>
                <AccordionItem value="advanced">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      Advanced Options
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Recursive Import</Label>
                          <p className="text-sm text-muted-foreground">
                            Import logs from subdirectories
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-detect Format</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically detect log format
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label>Time Zone</Label>
                        <Select defaultValue="utc">
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utc">UTC</SelectItem>
                            <SelectItem value="local">Local Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Start Import'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-full">
              <Cloud className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Total Imports</h3>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-full">
              <FileText className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Files Imported</h3>
              <p className="text-2xl font-bold">1,234</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/10 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold">Last Import</h3>
              <p className="text-sm font-medium">2 mins ago</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/10 p-3 rounded-full">
              <FolderOpen className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Active Sources</h3>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Imports */}
      {importing && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">Importing logs...</h3>
                <p className="text-sm text-muted-foreground">
                  my-logs-bucket/prod/logs/2024/01/
                </p>
              </div>
              <Button variant="ghost" size="sm">Cancel</Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress}% complete</span>
                <span>{progress}/100 files processed</span>
              </div>
              <Progress value={progress} />
            </div>
          </div>
        </Card>
      )}

      {/* Import History */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Import History</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bucket & Path</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.bucket}</div>
                      <div className="text-sm text-muted-foreground">{item.path}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.status === 'completed' ? (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500">
                        <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
                        In Progress
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.files} files</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {item.timestamp}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">View Logs</Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Import Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label>Auto-Import Schedule</Label>
              <p className="text-sm text-muted-foreground">
                Automatically import new logs on schedule
              </p>
            </div>
            <Select defaultValue="hourly">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label>Retention Policy</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete imported logs after period
              </p>
            </div>
            <Select defaultValue="90">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label>Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about import status
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default S3Import;
