import { AnimatePresence } from "framer-motion";
import { Log } from "../types";
import { LogCard } from "./LogCard";
import { toast } from "sonner";

interface ListViewProps {
  logs: Log[];
  bookmarkedLogs: Set<string>;
  setSelectedLog: (log: Log) => void;
  formatTimestamp: (timestamp: string) => string;
  toggleBookmark: (id: string) => void;
  setQuickFilter: (query: string) => void;
}

export function ListView({
  logs,
  bookmarkedLogs,
  setSelectedLog,
  formatTimestamp,
  toggleBookmark,
  setQuickFilter,
}: ListViewProps) {
  const handleShare = (log: Log) => {
    // Implement share logic
    toast.success("Share feature coming soon!");
  };

  const handleDownload = (log: Log) => {
    // Implement download logic
    toast.success("Download feature coming soon!");
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  return (
    <AnimatePresence mode="popLayout">
      {logs.map((log, index) => (
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
    </AnimatePresence>
  );
}
