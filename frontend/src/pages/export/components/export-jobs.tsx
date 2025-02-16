import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExportStore } from "@/store/useExportStore";
import { Download, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

export function ExportJobs() {
  const { recentExports, clearCompletedJobs } = useExportStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Export Jobs</h3>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompletedJobs}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Completed
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentExports.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-xs">
                  {job.id}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {formatDistanceToNow(new Date(job.created_at), {
                          addSuffix: true,
                        })}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{new Date(job.created_at).toLocaleString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {job.filters.format.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(job.status)}>
                    {job.status === "processing" && (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    )}
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.status === "completed" ? "2.5 MB" : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {job.status === "completed" && job.download_url && (
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {job.status === "failed" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Retry export</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
