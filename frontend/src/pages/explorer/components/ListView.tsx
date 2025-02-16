import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Log, getLevelDetails } from "../utils";
import { Bookmark, BookmarkCheck, Copy, Download, Filter, Maximize2, Share2, Terminal } from "lucide-react";
import { toast } from "sonner";

interface ListViewProps {
  logs: Log[];
  bookmarkedLogs: Set<string>;
  toggleBookmark: (id: string) => void;
  setSelectedLog: (log: Log | null) => void;
  handleCopy: (content: string, id: string) => void;
  handleShare: (log: Log) => void;
  handleDownload: (log: Log) => void;
  setQuickFilter: (query: string) => void;
  formatTimestamp: (timestamp: string) => string;
}

export function ListView({
  logs,
  bookmarkedLogs,
  toggleBookmark,
  setSelectedLog,
  handleCopy,
  handleShare,
  handleDownload,
  setQuickFilter,
  formatTimestamp,
}: ListViewProps) {
  return (
    <AnimatePresence mode="popLayout">
      {logs.map((log, index) => {
        const levelDetails = getLevelDetails(log.level);
        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="group relative hover:shadow-md transition-all duration-200 border-l-4 mb-2"
              style={{ borderLeftColor: levelDetails.borderColor }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={`flex items-center gap-1.5 ${levelDetails.color} shrink-0`}>
                      {levelDetails.icon}
                      {log.level}
                    </Badge>
                    <Badge variant="outline" className="font-mono shrink-0">
                      {log.service}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm text-muted-foreground p-0 h-auto font-normal hover:text-primary"
                    >
                      {formatTimestamp(log.timestamp)}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => toggleBookmark(log.id)}
                    >
                      {bookmarkedLogs.has(log.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Terminal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopy(JSON.stringify(log, null, 2), log.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy as JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(log)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Log
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(log)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          const query = `level:${log.level} service:${log.service}`;
                          setQuickFilter(query);
                          toast.success(`Quick filter set to: ${query}`);
                        }}>
                          <Filter className="h-4 w-4 mr-2" />
                          Filter Similar Logs
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="font-mono text-sm text-muted-foreground break-all">
                    {log.message}
                  </div>
                  
                  {(log.action || log.file || log.func_name) && (
                    <div className="grid gap-2 text-xs text-muted-foreground font-mono">
                      {log.action && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium shrink-0">Action:</span>
                          <span className="break-all">{log.action}</span>
                        </div>
                      )}
                      {log.file && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium shrink-0">File:</span>
                          <span className="break-all">{log.file}</span>
                        </div>
                      )}
                      {log.func_name && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium shrink-0">Function:</span>
                          <span className="break-all">{log.func_name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {Object.keys(log.metadata).length > 0 && (
                    <CardDescription>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex flex-wrap gap-2 cursor-pointer">
                            {Object.entries(log.metadata)
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs inline-flex items-center max-w-[200px]">
                                  <span className="truncate">
                                    {key}: {value}
                                  </span>
                                </Badge>
                              ))}
                            {Object.keys(log.metadata).length > 3 && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                +{Object.keys(log.metadata).length - 3} more
                              </Badge>
                            )}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Metadata</h4>
                            <div className="grid gap-1">
                              {Object.entries(log.metadata).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-[auto,1fr] gap-2 text-xs items-center">
                                  <span className="font-medium text-muted-foreground whitespace-nowrap">{key}:</span>
                                  <span className="font-mono truncate">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </CardDescription>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
