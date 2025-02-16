import { useState } from "react";
import { useImportStore } from "@/store/useImportStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CloudCog } from "lucide-react";
import { ImportConfig } from "./import-config";

export function S3Import() {
  const { importFromS3, isLoading, error } = useImportStore();
  const [s3Config, setS3Config] = useState({
    bucket: "",
    region: "",
    prefix: "",
    accessKeyId: "",
    secretAccessKey: "",
    assumeRole: "",
  });

  const [importConfig, setImportConfig] = useState({
    source: "s3" as const,
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

  const handleS3ConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setS3Config((prev) => ({ ...prev, [name]: value }));
  };

  const handleImportConfigChange = (newConfig: any) => {
    setImportConfig({ ...importConfig, ...newConfig });
  };

  const handleImport = async () => {
    await importFromS3(s3Config, importConfig);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="bucket">S3 Bucket</Label>
          <Input
            id="bucket"
            name="bucket"
            value={s3Config.bucket}
            onChange={handleS3ConfigChange}
            placeholder="my-logs-bucket"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            name="region"
            value={s3Config.region}
            onChange={handleS3ConfigChange}
            placeholder="us-east-1"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="prefix">Prefix (Optional)</Label>
          <Input
            id="prefix"
            name="prefix"
            value={s3Config.prefix}
            onChange={handleS3ConfigChange}
            placeholder="logs/2024/"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="accessKeyId">Access Key ID</Label>
          <Input
            id="accessKeyId"
            name="accessKeyId"
            value={s3Config.accessKeyId}
            onChange={handleS3ConfigChange}
            type="password"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="secretAccessKey">Secret Access Key</Label>
          <Input
            id="secretAccessKey"
            name="secretAccessKey"
            value={s3Config.secretAccessKey}
            onChange={handleS3ConfigChange}
            type="password"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="assumeRole">
            Assume Role ARN (Optional)
          </Label>
          <Input
            id="assumeRole"
            name="assumeRole"
            value={s3Config.assumeRole}
            onChange={handleS3ConfigChange}
            placeholder="arn:aws:iam::123456789012:role/LogImportRole"
          />
        </div>
      </div>

      <ImportConfig config={importConfig} onChange={handleImportConfigChange} />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleImport}
          disabled={isLoading || !s3Config.bucket || !s3Config.region}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <CloudCog className="mr-2 h-4 w-4" />
              Import from S3
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
