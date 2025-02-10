import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCcw,
} from 'lucide-react';

const SecurityScore = () => (
  <Card className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold">Security Score</h3>
        <p className="text-sm text-muted-foreground">Overall system security status</p>
      </div>
      <Button variant="outline" size="sm">
        <RefreshCcw className="h-4 w-4 mr-2" />
        Refresh Score
      </Button>
    </div>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">85/100</span>
        <Badge className="bg-green-500">Good</Badge>
      </div>
      <Progress value={85} className="h-2" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="space-y-1">
          <div className="text-sm font-medium">Access Control</div>
          <div className="text-2xl font-bold text-green-500">92%</div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium">Data Encryption</div>
          <div className="text-2xl font-bold text-yellow-500">78%</div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium">Compliance</div>
          <div className="text-2xl font-bold text-green-500">88%</div>
        </div>
      </div>
    </div>
  </Card>
);

const Security = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Security & Compliance</h1>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-full">
              <Shield className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Threat Detection</h3>
              <p className="text-sm text-muted-foreground">Active Protection</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-full">
              <Lock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Data Encryption</h3>
              <p className="text-sm text-muted-foreground">End-to-end</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/10 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold">Vulnerabilities</h3>
              <p className="text-sm text-muted-foreground">3 Pending Actions</p>
            </div>
          </div>
        </Card>
      </div>

      <SecurityScore />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>GDPR Compliance</span>
              </div>
              <Badge>Compliant</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>HIPAA Compliance</span>
              </div>
              <Badge>Compliant</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-yellow-500" />
                <span>SOC 2 Compliance</span>
              </div>
              <Badge variant="outline">In Progress</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Security Events</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Failed Login Attempt</TableCell>
                <TableCell>
                  <Badge variant="destructive">High Risk</Badge>
                </TableCell>
                <TableCell>5 mins ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>New API Key Generated</TableCell>
                <TableCell>
                  <Badge variant="secondary">Info</Badge>
                </TableCell>
                <TableCell>1 hour ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Encryption Key Rotation</TableCell>
                <TableCell>
                  <Badge>Success</Badge>
                </TableCell>
                <TableCell>3 hours ago</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Access Control Audit</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>john.doe@example.com</TableCell>
              <TableCell>Production Logs</TableCell>
              <TableCell>View</TableCell>
              <TableCell>192.168.1.1</TableCell>
              <TableCell>2 mins ago</TableCell>
              <TableCell>
                <Badge>Authorized</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>admin@example.com</TableCell>
              <TableCell>API Keys</TableCell>
              <TableCell>Modify</TableCell>
              <TableCell>192.168.1.2</TableCell>
              <TableCell>15 mins ago</TableCell>
              <TableCell>
                <Badge>Authorized</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>unknown@test.com</TableCell>
              <TableCell>Admin Panel</TableCell>
              <TableCell>Access</TableCell>
              <TableCell>192.168.1.100</TableCell>
              <TableCell>1 hour ago</TableCell>
              <TableCell>
                <Badge variant="destructive">Unauthorized</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Security;
