import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportFilters } from "./components/export-filters";
import { ExportJobs } from "./components/export-jobs";
import { ExportPreview } from "./components/export-preview";

export default function ExportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Export Logs</h2>
        <p className="text-muted-foreground">
          Export your logs with advanced filtering and formatting options.
        </p>
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">New Export</TabsTrigger>
          <TabsTrigger value="jobs">Export Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Export Configuration</CardTitle>
                <CardDescription>
                  Configure your log export filters and options.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportFilters />
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Preview of logs matching your filters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportPreview />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Jobs</CardTitle>
              <CardDescription>
                View and manage your export jobs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportJobs />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
