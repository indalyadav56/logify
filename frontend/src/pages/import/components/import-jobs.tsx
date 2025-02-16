import { useEffect } from "react";
import { useImportStore } from "@/store/useImportStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";

export function ImportJobs() {
  const { jobs, retryJob, deleteJob, error } = useImportStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Jobs</CardTitle>
        <CardDescription>Recent and ongoing import jobs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No import jobs yet
            </div>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium">{job.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Started: {formatDate(job.startTime)}
                    </div>
                    {job.endTime && (
                      <div className="text-sm text-muted-foreground">
                        Ended: {formatDate(job.endTime)}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {job.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => retryJob(job.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteJob(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {job.status === "processing" && (
                  <div className="mt-4 space-y-2">
                    <Progress value={job.progress} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {job.processedRecords} / {job.totalRecords} records
                      </span>
                      <span>{job.progress.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {job.status === "failed" && job.errors.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-destructive">
                      Errors:
                    </div>
                    <ul className="mt-1 text-sm space-y-1">
                      {job.errors.slice(0, 3).map((error, index) => (
                        <li key={index} className="text-muted-foreground">
                          Line {error.line}: {error.message}
                        </li>
                      ))}
                      {job.errors.length > 3 && (
                        <li className="text-muted-foreground">
                          And {job.errors.length - 3} more errors...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
