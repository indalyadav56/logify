import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Trash2,
  Download,
  RefreshCw,
  Filter,
  Settings,
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LogFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  timestamp: Date;
  lineCount?: number;
  format?: string;
}

const LogImport = () => {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [autoDetectFormat, setAutoDetectFormat] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState('syslog');
  const [filterPattern, setFilterPattern] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'pending' as const,
      progress: 0,
      timestamp: new Date(),
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate processing files
    newFiles.forEach(file => {
      processFile(file.id);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.log'],
    },
    multiple: true
  });

  const processFile = (fileId: string) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return { ...file, status: 'processing' as const };
      }
      return file;
    }));

    // Simulate file processing
    const interval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const progress = Math.min(file.progress + 10, 100);
          if (progress === 100) {
            clearInterval(interval);
            return {
              ...file,
              progress,
              status: 'completed' as const,
              lineCount: Math.floor(Math.random() * 10000),
              format: autoDetectFormat ? detectFormat(file.name) : selectedFormat
            };
          }
          return { ...file, progress };
        }
        return file;
      }));
    }, 500);
  };

  const detectFormat = (filename: string): string => {
    // Simple format detection based on file patterns
    if (filename.includes('syslog')) return 'syslog';
    if (filename.includes('apache')) return 'apache';
    if (filename.includes('nginx')) return 'nginx';
    if (filename.includes('json')) return 'json';
    return 'unknown';
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const retryFile = (fileId: string) => {
    processFile(fileId);
  };

  const downloadFile = (fileId: string) => {
    // Implement file download logic
    console.log('Downloading file:', fileId);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Log File Import</h1>
          <p className="text-muted-foreground">Import and analyze your log files</p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Import Settings
        </Button>
      </div>

      {/* Import Options */}
      <Card>
        <CardHeader>
          <CardTitle>Import Options</CardTitle>
          <CardDescription>Configure how your log files should be processed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-detect format</Label>
              <p className="text-sm text-muted-foreground">
                Automatically detect log file format based on content
              </p>
            </div>
            <Switch
              checked={autoDetectFormat}
              onCheckedChange={setAutoDetectFormat}
            />
          </div>
          {!autoDetectFormat && (
            <div className="space-y-2">
              <Label>Log Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="syslog">Syslog</SelectItem>
                  <SelectItem value="apache">Apache</SelectItem>
                  <SelectItem value="nginx">Nginx</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Filter Pattern (Optional)</Label>
            <Input
              placeholder="e.g., *.error.log"
              value={filterPattern}
              onChange={(e) => setFilterPattern(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors
          ${isDragActive ? 'border-primary' : 'border-muted'}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-1">Drop your log files here</h3>
        <p className="text-muted-foreground mb-2">or click to select files</p>
        <p className="text-sm text-muted-foreground">Supports .log files up to 1GB</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Imported Files</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Lines</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {file.name}
                      </div>
                    </TableCell>
                    <TableCell>{formatBytes(file.size)}</TableCell>
                    <TableCell>{file.format || '-'}</TableCell>
                    <TableCell>{file.lineCount?.toLocaleString() || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          file.status === 'completed' ? 'default' :
                          file.status === 'failed' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {file.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Progress value={file.progress} className="w-[100px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {file.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => retryFile(file.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        {file.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadFile(file.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LogImport;
