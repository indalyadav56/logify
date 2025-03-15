import { useAuditStore, AuditAction, AuditLogLevel } from "@/store/useAuditStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Link,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AuditLogList() {
  const { logs, isLoading } = useAuditStore();
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const getActionColor = (action: AuditAction) => {
    if (action.includes('created')) return 'success';
    if (action.includes('deleted') || action.includes('removed')) return 'destructive';
    if (action.includes('updated')) return 'warning';
    return 'secondary';
  };

  const getLevelIcon = (level: AuditLogLevel) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getMetadataDisplay = (metadata: Record<string, any>) => {
    return (
      <div className="space-y-2">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key}>
            <span className="font-medium">{key}: </span>
            <span className="text-muted-foreground">
              {typeof value === 'object' ? JSON.stringify(value) : value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading audit logs...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {formatDistanceToNow(new Date(log.created_at), {
                            addSuffix: true,
                          })}
                        </TooltipTrigger>
                        <TooltipContent>
                          {new Date(log.created_at).toLocaleString()}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.actor_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {log.actor_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.target_name && (
                      <div className="flex items-center gap-2">
                        <span>{log.target_name}</span>
                        {log.target_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => {
                              // Navigate to target
                            }}
                          >
                            <Link className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      <span className="capitalize">{log.level}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedLog(log.id)}>
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              {(() => {
                const log = logs.find((l) => l.id === selectedLog);
                if (!log) return null;

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Actor</h4>
                        <p className="text-sm">
                          {log.actor_name} ({log.actor_email})
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Time</h4>
                        <p className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Action</h4>
                        <Badge variant={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Level</h4>
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          <span className="capitalize">{log.level}</span>
                        </div>
                      </div>
                      {log.team_id && (
                        <div>
                          <h4 className="font-medium mb-1">Team</h4>
                          <p className="text-sm font-mono">{log.team_id}</p>
                        </div>
                      )}
                      {log.project_id && (
                        <div>
                          <h4 className="font-medium mb-1">Project</h4>
                          <p className="text-sm font-mono">{log.project_id}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm">{log.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Additional Details</h4>
                      {getMetadataDisplay(log.metadata)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">IP Address: </span>
                        {log.ip_address}
                      </div>
                      <div>
                        <span className="font-medium">User Agent: </span>
                        {log.user_agent}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
