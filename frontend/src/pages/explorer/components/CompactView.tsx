import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Log } from "../types";
import { getLevelDetails } from "../utils";

interface CompactViewProps {
  logs: Log[];
  bookmarkedLogs: Set<string>;
  setSelectedLog: (log: Log) => void;
  formatTimestamp: (timestamp: string) => string;
}

export const CompactView = ({
  logs,
  bookmarkedLogs,
  setSelectedLog,
  formatTimestamp,
}: CompactViewProps) => {
  return (
    <Card className="">
      <CardContent className="p-0">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {logs.map((log) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b hover:bg-muted/50 group/row cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-4 py-2 font-mono text-xs">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`${getLevelDetails(log.level).color}`}
                      >
                        {log.level}
                      </Badge>
                      <span className="truncate">{log.message}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
