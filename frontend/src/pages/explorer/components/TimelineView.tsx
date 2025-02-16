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
import { LogCard } from "./LogCard";
import { toast } from "sonner";

interface TimelineViewProps {
  logs: Log[];
  bookmarkedLogs: Set<string>;
  setSelectedLog: (log: Log) => void;
  formatTimestamp: (timestamp: string) => string;
  toggleBookmark: (id: string) => void;
  setQuickFilter: (query: string) => void;
}

export function TimelineView({
  logs,
  bookmarkedLogs,
  setSelectedLog,
  formatTimestamp,
  toggleBookmark,
  setQuickFilter,
}: TimelineViewProps) {
  const handleShare = (log: Log) => {
    toast.success("Share feature coming soon!");
  };

  const handleDownload = (log: Log) => {
    toast.success("Download feature coming soon!");
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  // Group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = format(new Date(log.timestamp), 'MMMM do, yyyy');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, Log[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedLogs).map(([date, dateLogs]) => (
        <div key={date} className="space-y-4">
          <div className="sticky top-0 z-10 flex items-center gap-4">
            <div className="text-lg font-semibold">{date}</div>
            <div className="h-[1px] flex-1 bg-border" />
          </div>
          <div className="grid gap-4 pl-4">
            {dateLogs.map((log, index) => (
              <LogCard
                key={log.id}
                log={log}
                index={index}
                isBookmarked={bookmarkedLogs.has(log.id)}
                formatTimestamp={formatTimestamp}
                onBookmark={toggleBookmark}
                onShare={handleShare}
                onDownload={handleDownload}
                onCopy={handleCopy}
                onSetQuickFilter={setQuickFilter}
                onSelect={setSelectedLog}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
