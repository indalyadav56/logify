import { Log } from "@/types/log";
import { LogCard } from "./LogCard";
import { toast } from "sonner";
import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface ListViewProps {
  logs: Log[];
  bookmarkedLogs: Set<string>;
  setSelectedLog: (log: Log) => void;
  formatTimestamp: (timestamp: string) => string;
  toggleBookmark: (id: string) => void;
  setQuickFilter: (query: string) => void;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  isRefreshing: boolean;
}

export function ListView({
  logs,
  bookmarkedLogs,
  setSelectedLog,
  formatTimestamp,
  toggleBookmark,
  setQuickFilter,
  hasMore,
  isLoading,
  onLoadMore,
  isRefreshing,
}: ListViewProps) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle observer setup and cleanup
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading && !isRefreshing) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore, isRefreshing]
  );

  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const target = observerTarget.current;
    
    // Only set up observer if we have a target, not refreshing, and have more logs
    if (target && !isRefreshing && hasMore) {
      const observer = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: "120px",
        threshold: 0.1,
      });

      observer.observe(target);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, hasMore, isRefreshing]);

  const handleShare = (log: Log) => {
    toast.success("Share feature coming soon!");
  };

  const handleDownload = (log: Log) => {
    toast.success("Download feature coming soon!");
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        No logs found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Log list */}
      <div className="space-y-2">
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
      </div>

      {/* Load more indicator */}
      {!isRefreshing && hasMore && (
        <div ref={observerTarget} className="py-4 text-center">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          ) : (
            <div className="h-4" /> // Spacer for intersection observer
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && logs.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No more logs to load
        </div>
      )}
    </div>
  );
}
