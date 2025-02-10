import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { DatePickerWithRange } from "./DateRangePicker";

// Sample report templates
const reportTemplates = [
  {
    id: "1",
    name: "Error Summary Report",
    description: "Daily summary of errors across all services",
    schedule: "Daily",
    lastRun: "2024-01-28T15:30:00",
    status: "completed",
    recipients: ["team@company.com"],
  },
  {
    id: "2",
    name: "Performance Metrics Report",
    description: "Weekly performance analysis of all services",
    schedule: "Weekly",
    lastRun: "2024-01-25T00:00:00",
    status: "scheduled",
    recipients: ["ops@company.com", "dev@company.com"],
  },
];

// Sample generated reports
const generatedReports = [
  {
    id: "1",
    name: "Error Summary Report - Jan 28, 2024",
    template: "Error Summary Report",
    generatedAt: "2024-01-28T15:30:00",
    size: "2.5 MB",
    format: "PDF",
  },
  {
    id: "2",
    name: "Performance Metrics - Week 4",
    template: "Performance Metrics Report",
    generatedAt: "2024-01-25T00:00:00",
    size: "4.8 MB",
    format: "Excel",
  },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Report Template</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Report Template</DialogTitle>
              <DialogDescription>
                Configure a new report template with scheduling options
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Report Name</Label>
                <Input id="name" placeholder="e.g., Daily Error Summary" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the purpose and contents of this report"
                />
              </div>

              <div className="grid gap-2">
                <Label>Report Sections</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch id="errors" />
                    <Label htmlFor="errors">Error Summary</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="performance" />
                    <Label htmlFor="performance">Performance Metrics</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="alerts" />
                    <Label htmlFor="alerts">Alert History</Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="format">Export Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Input 
                  id="recipients" 
                  placeholder="Enter email addresses (comma-separated)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Create Template</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Report Templates */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.description}</TableCell>
                <TableCell>{template.schedule}</TableCell>
                <TableCell>{new Date(template.lastRun).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={template.status === "completed" ? "default" : "secondary"}
                  >
                    {template.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Run Now</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Generated Reports */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generated Reports</h2>
          <DatePickerWithRange />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Generated At</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {generatedReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.name}</TableCell>
                <TableCell>{report.template}</TableCell>
                <TableCell>{new Date(report.generatedAt).toLocaleString()}</TableCell>
                <TableCell>{report.size}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {report.format}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Download</Button>
                    <Button variant="ghost" size="sm">Share</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Reports;
