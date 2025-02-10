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
import { DatePickerWithRange } from "./DateRangePicker";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "./ui/textarea";

// Sample data
const logData = [
  {
    id: "1",
    timestamp: "2024-01-28T10:00:00",
    level: "ERROR",
    service: "auth-service",
    message: "Failed to authenticate user",
    userId: "user123",
    errorCode: "AUTH001",
    stack: `Error: Failed to authenticate user
    at AuthService.authenticate (/src/services/auth.ts:45)
    at async UserController.login (/src/controllers/user.ts:23)
    at async /src/routes/auth.ts:12:3`,
    metadata: {
      ip: "192.168.1.1",
      browser: "Chrome 120.0.0",
      os: "Windows 11"
    }
  },
  // Add more sample logs...
];

const LogExplorer = () => {
  const [selectedLog, setSelectedLog] = React.useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Log Explorer</h1>
        <div className="flex items-center gap-4">
          <DatePickerWithRange />
          <Button>Export Results</Button>
        </div>
      </div>

      {/* Advanced Query Builder */}
      <Card className="p-4">
        <div className="space-y-4">
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

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prod">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="dev">Development</SelectItem>
              </SelectContent>
            </Select>

            <Input placeholder="Search logs..." />
          </div>

          <Textarea
            placeholder="Enter custom query (e.g., level = 'ERROR' AND service = 'auth-service' OR message CONTAINS 'failed')"
            className="font-mono text-sm"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline">Clear</Button>
            <Button>Search</Button>
          </div>
        </div>
      </Card>

      {/* Results Table */}
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
            {logData.map((log) => (
              <TableRow key={log.id}>
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
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        View Details
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[800px] sm:w-[800px]">
                      <SheetHeader>
                        <SheetTitle>Log Details</SheetTitle>
                        <SheetDescription>
                          Detailed information about the selected log entry
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Basic Information</h4>
                            <div className="space-y-2">
                              <div>
                                <span className="text-muted-foreground">Timestamp:</span>{' '}
                                {new Date(selectedLog?.timestamp).toLocaleString()}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Level:</span>{' '}
                                <Badge
                                  variant={selectedLog?.level === "ERROR" ? "destructive" : 
                                          selectedLog?.level === "INFO" ? "default" : "warning"}
                                >
                                  {selectedLog?.level}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Service:</span>{' '}
                                {selectedLog?.service}
                              </div>
                              <div>
                                <span className="text-muted-foreground">User ID:</span>{' '}
                                {selectedLog?.userId}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Error Code:</span>{' '}
                                {selectedLog?.errorCode}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Metadata</h4>
                            <div className="space-y-2">
                              {selectedLog?.metadata && Object.entries(selectedLog.metadata).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-muted-foreground">{key}:</span>{' '}
                                  {value as string}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Message</h4>
                          <Card className="p-4 bg-muted">
                            {selectedLog?.message}
                          </Card>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Stack Trace</h4>
                          <Card className="p-4 bg-muted">
                            <pre className="whitespace-pre-wrap font-mono text-sm">
                              {selectedLog?.stack}
                            </pre>
                          </Card>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LogExplorer;
