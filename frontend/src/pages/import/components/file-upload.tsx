import { useState } from "react";
import { useImportStore } from "@/store/useImportStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload } from "lucide-react";
import { DropZone } from "./drop-zone";
import { ImportConfig } from "./import-config";

export function FileUpload() {
  const { uploadFile, isLoading, error } = useImportStore();
  const [files, setFiles] = useState<File[]>([]);
  const [config, setConfig] = useState({
    source: "file" as const,
    format: "json" as const,
    parseOptions: {
      delimiter: ",",
      timeField: "timestamp",
      timeFormat: "ISO8601",
      levelField: "level",
      messageField: "message",
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

  const handleFileChange = (files: File[]) => {
    setFiles(files);
  };

  const handleConfigChange = (newConfig: any) => {
    setConfig({ ...config, ...newConfig });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    await uploadFile(files, config);
  };

  return (
    <div className="space-y-4">
      <DropZone onFilesSelected={handleFileChange} />

      {files.length > 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Selected Files</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <span>{file.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <ImportConfig config={config} onChange={handleConfigChange} />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={isLoading || files.length === 0}
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
        </div>
      )}
    </div>
  );
}
