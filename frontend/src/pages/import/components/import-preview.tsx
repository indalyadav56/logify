import { useImportStore } from "@/store/useImportStore";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function ImportPreview() {
  const { activeJob } = useImportStore();

  if (!activeJob) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Preview</CardTitle>
        <CardDescription>
          Preview of the data being imported and validation results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeJob.status === "processing" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Statistics</h4>
                <div className="flex space-x-4">
                  <div>
                    <span className="text-2xl font-bold">
                      {activeJob.totalRecords}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Total Records
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold">
                      {activeJob.processedRecords}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Processed
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-destructive">
                      {activeJob.failedRecords}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Failed
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Badge variant={activeJob.status === "processing" ? "default" : "secondary"}>
                  {activeJob.status}
                </Badge>
              </div>
            </div>

            {activeJob.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <div className="font-medium mb-2">Import Errors:</div>
                  <ul className="list-disc pl-4 space-y-1">
                    {activeJob.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>
                        Line {error.line}: {error.message}
                      </li>
                    ))}
                    {activeJob.errors.length > 5 && (
                      <li>And {activeJob.errors.length - 5} more errors...</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {activeJob.metadata.preview && (
              <div>
                <h4 className="text-sm font-medium mb-4">Data Preview</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {activeJob.metadata.preview.headers.map(
                          (header: string) => (
                            <TableHead key={header}>{header}</TableHead>
                          )
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeJob.metadata.preview.sample.map(
                        (row: any, index: number) => (
                          <TableRow key={index}>
                            {activeJob.metadata.preview.headers.map(
                              (header: string) => (
                                <TableCell key={header}>
                                  {row[header]?.toString() || ""}
                                </TableCell>
                              )
                            )}
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
