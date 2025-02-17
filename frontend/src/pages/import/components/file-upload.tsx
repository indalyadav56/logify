import { useState } from "react";
import { useImportStore } from "@/store/useImportStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { DropZone } from "./drop-zone";
import { ImportConfig } from "./import-config";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FileUpload() {
  const { uploadFile, isLoading, error } = useImportStore();
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [config, setConfig] = useState({
    source: "file" as const,
    format: "unstructured" as const,
    parseOptions: {
      delimiter: ",",
      timeField: "timestamp",
      timeFormat: "ISO8601",
      levelField: "level",
      messageField: "message",
      serviceField: "service",
    },
    parserConfig: {
      customRules: [],
    },
    transformations: {
      enabled: false,
      rules: [],
    },
    validation: {
      enabled: true,
      rules: [
        {
          field: "timestamp",
          type: "required" as const,
          params: {},
        },
        {
          field: "level",
          type: "required" as const,
          params: {},
        },
        {
          field: "message",
          type: "required" as const,
          params: {},
        },
      ],
    },
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileValidation, setFileValidation] = useState<Record<string, { valid: boolean; message?: string }>>({});

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
    // Validate each file
    const validation: Record<string, { valid: boolean; message?: string }> = {};
    newFiles.forEach(file => {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        validation[file.name] = {
          valid: false,
          message: "File size exceeds 100MB limit"
        };
      } else {
        validation[file.name] = {
          valid: true
        };
      }
    });
    setFileValidation(validation);
  };

  const handleConfigChange = (newConfig: any) => {
    setConfig({ ...config, ...newConfig });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 95) {
        clearInterval(interval);
      }
      setUploadProgress(progress);
    }, 100);

    try {
      await uploadFile(files, config);
      setUploadProgress(100);
    } catch (err) {
      setUploadProgress(0);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'json':
        return '{ }';
      case 'csv':
        return '📊';
      case 'txt':
      case 'log':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="config">
            <FileText className="h-4 w-4 mr-2" />
            Configure Parser
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <DropZone onFilesSelected={handleFileChange} />

          {files.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Selected Files</h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getFileIcon(file.name)}</span>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {fileValidation[file.name] && (
                        <div className="flex items-center">
                          {fileValidation[file.name].valid ? (
                            <Badge variant="success" className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {fileValidation[file.name].message}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">
                {uploadProgress === 100 ? 'Upload complete!' : `Uploading... ${uploadProgress}%`}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={isLoading || files.length === 0 || Object.values(fileValidation).some(v => !v.valid)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="config">
          <ImportConfig config={config} onChange={handleConfigChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
