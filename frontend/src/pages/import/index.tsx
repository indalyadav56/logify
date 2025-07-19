import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "./components/file-upload";
import { S3Import } from "./components/s3-import";
import { ImportJobs } from "./components/import-jobs";
import { ImportPreview } from "./components/import-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  FileText,
  Settings,
  Database,
  History,
} from "lucide-react";

export default function ImportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Import Logs</h2>
          <p className="text-muted-foreground">
            Import and parse logs from various sources
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* Import Sources */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Import Source</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Beta</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="file" className="space-y-4">
                <TabsList className="grid grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="file" className="space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>File Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="s3" className="space-x-2">
                    <Database className="h-4 w-4" />
                    <span>Amazon S3</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4">
                  <FileUpload />
                </TabsContent>

                <TabsContent value="s3" className="space-y-4">
                  <S3Import />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <ImportPreview />
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-2">
                  <span className="text-muted-foreground text-sm">
                    Total Imports
                  </span>
                  <span className="text-2xl font-bold">1,234</span>
                  <span className="text-xs text-green-500 flex items-center">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    +12.3% this week
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-2">
                  <span className="text-muted-foreground text-sm">
                    Success Rate
                  </span>
                  <span className="text-2xl font-bold">98.2%</span>
                  <span className="text-xs text-green-500 flex items-center">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    +2.1% this week
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Jobs */}
          <ImportJobs />
        </div>
      </div>
    </div>
  );
}
