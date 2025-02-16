import { useImportStore } from "@/store/useImportStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "./components/file-upload";
import { S3Import } from "./components/s3-import";
// import { UrlImport } from "./components/url-import";
// import { ApiImport } from "./components/api-import";
import { ImportJobs } from "./components/import-jobs";
import { ImportPreview } from "./components/import-preview";

export default function ImportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Import Logs</h2>
          <p className="text-muted-foreground">
            Import logs from various sources with advanced parsing and validation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        <div className="col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Import Source</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="file" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="file">File Upload</TabsTrigger>
                  <TabsTrigger value="s3">Amazon S3</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="api">API</TabsTrigger>
                </TabsList>

                <TabsContent value="file">
                  <FileUpload />
                </TabsContent>

                <TabsContent value="s3">
                  <S3Import />
                </TabsContent>

                {/* <TabsContent value="url">
                  <UrlImport />
                </TabsContent>

                <TabsContent value="api">
                  <ApiImport />
                </TabsContent> */}
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-4">
            <ImportPreview />
          </div>
        </div>

        <div className="col-span-2">
          <ImportJobs />
        </div>
      </div>
    </div>
  );
}
