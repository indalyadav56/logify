import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Log, getLevelDetails } from "../utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogDetailDialogProps {
  log: Log | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatTimestamp: (timestamp: string) => string;
}

export function LogDetailDialog({
  log,
  open,
  onOpenChange,
  formatTimestamp,
}: LogDetailDialogProps) {
  if (!log) return null;
  const levelDetails = getLevelDetails(log.level);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="secondary" className={`flex items-center gap-1.5 ${levelDetails.color}`}>
              {levelDetails.icon}
              {log.level}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {log.service}
            </Badge>
            <span className="text-sm font-normal text-muted-foreground">
              {formatTimestamp(log.timestamp)}
            </span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 px-1">
            <div>
              <h4 className="text-sm font-medium mb-1">Message</h4>
              <p className="text-sm text-muted-foreground font-mono break-all">
                {log.message}
              </p>
            </div>

            {(log.action || log.file || log.func_name) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Details</h4>
                <div className="grid gap-2 text-sm">
                  {log.action && (
                    <div className="grid grid-cols-[100px,1fr] gap-2">
                      <span className="font-medium text-muted-foreground">Action:</span>
                      <span className="font-mono">{log.action}</span>
                    </div>
                  )}
                  {log.file && (
                    <div className="grid grid-cols-[100px,1fr] gap-2">
                      <span className="font-medium text-muted-foreground">File:</span>
                      <span className="font-mono">{log.file}</span>
                    </div>
                  )}
                  {log.func_name && (
                    <div className="grid grid-cols-[100px,1fr] gap-2">
                      <span className="font-medium text-muted-foreground">Function:</span>
                      <span className="font-mono">{log.func_name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {Object.keys(log.metadata).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Metadata</h4>
                <div className="grid gap-2 text-sm">
                  {Object.entries(log.metadata).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[1fr,2fr] gap-4">
                      <span className="font-medium text-muted-foreground">{key}:</span>
                      <span className="font-mono break-all">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
