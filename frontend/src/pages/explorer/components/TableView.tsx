import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Log, getLevelDetails } from "../utils";
import { Bookmark, BookmarkCheck, Maximize2 } from "lucide-react";

interface TableViewProps {
  logs: Log[];
  bookmarkedLogs: Set<string>;
  toggleBookmark: (id: string) => void;
  setSelectedLog: (log: Log | null) => void;
  formatTimestamp: (timestamp: string) => string;
}

export function TableView({
  logs,
  bookmarkedLogs,
  toggleBookmark,
  setSelectedLog,
  formatTimestamp,
}: TableViewProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const levelDetails = getLevelDetails(log.level);
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b hover:bg-muted/50 group/row"
                  >
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={`flex items-center gap-1.5 ${levelDetails.color}`}>
                        {levelDetails.icon}
                        {log.level}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-mono">
                        {log.service}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xl truncate">{log.message}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(log.id)}
                        >
                          {bookmarkedLogs.has(log.id) ? (
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
