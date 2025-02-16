import { motion } from "framer-motion";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Bookmark, BookmarkCheck, Copy, Download, Share2, Terminal, Maximize2 } from "lucide-react";
import { Log, getLevelDetails } from "../utils";

interface TimelineViewProps {
  logs: Log[];
  bookmarkedLogs: Set<string>;
  toggleBookmark: (id: string) => void;
  setSelectedLog: (log: Log | null) => void;
  formatTimestamp: (timestamp: string) => string;
}

export function TimelineView({
  logs,
  bookmarkedLogs,
  toggleBookmark,
  setSelectedLog,
  formatTimestamp,
}: TimelineViewProps) {
  // Group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = format(new Date(log.timestamp), 'MMMM do, yyyy');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, Log[]>);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleShare = (log: Log) => {
    // Implement share functionality
  };

  const handleDownload = (log: Log) => {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `log-${log.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto">
      {Object.entries(groupedLogs).map(([date, dateLogs]) => (
        <div key={date} className="space-y-4">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">{date}</h3>
            </div>
          </div>

          <div className="relative pl-8 space-y-4">
            {/* Timeline line */}
            <div className="absolute left-3 top-3 bottom-3 w-[2px] bg-gradient-to-b from-border via-border/50 to-border" />

            {dateLogs.map((log, index) => {
              const levelDetails = getLevelDetails(log.level);
              const dotColor = {
                error: 'bg-red-500',
                warning: 'bg-yellow-500',
                info: 'bg-blue-500',
              }[log.level.toLowerCase()] || 'bg-blue-500';

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div 
                    className={`absolute left-[-21px] top-6 w-4 h-4 rounded-full border-2 border-background ${dotColor} z-10`}
                  />

                  <Card 
                    className="group relative hover:shadow-md transition-all duration-200 border-l-4 overflow-hidden max-w-full"
                    style={{ borderLeftColor: levelDetails.borderColor }}
                  >
                    <CardHeader className="pb-2 px-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                          <Badge variant="secondary" className={`flex items-center gap-1.5 ${levelDetails.color} shrink-0`}>
                            {log.level}
                          </Badge>
                          <Badge variant="outline" className="font-mono shrink-0">
                            {log.service}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm text-muted-foreground p-0 h-auto font-normal hover:text-primary shrink-0"
                          >
                            {format(new Date(log.timestamp), 'HH:mm:ss')}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
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
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              >
                                <Terminal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCopy(JSON.stringify(log, null, 2))}>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-4 py-2">
                      <div className="space-y-2 overflow-hidden">
                        <p className="text-sm break-words whitespace-pre-wrap">{log.message}</p>
                        
                        {(log.action || log.file || log.func_name) && (
                          <div className="grid gap-1 text-xs text-muted-foreground">
                            {log.action && (
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="font-medium shrink-0">Action:</span>
                                <span className="font-mono truncate">{log.action}</span>
                              </div>
                            )}
                            {log.file && (
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="font-medium shrink-0">File:</span>
                                <span className="font-mono truncate">{log.file}</span>
                              </div>
                            )}
                            {log.func_name && (
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="font-medium shrink-0">Function:</span>
                                <span className="font-mono truncate">{log.func_name}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {Object.keys(log.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(log.metadata)
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <Badge 
                                  key={key} 
                                  variant="secondary" 
                                  className="text-xs max-w-full overflow-hidden"
                                >
                                  <span className="truncate inline-block max-w-[200px]">
                                    {key}: {String(value)}
                                  </span>
                                </Badge>
                              ))}
                            {Object.keys(log.metadata).length > 3 && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs cursor-pointer hover:bg-primary/20 shrink-0"
                                onClick={() => setSelectedLog(log)}
                              >
                                +{Object.keys(log.metadata).length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
