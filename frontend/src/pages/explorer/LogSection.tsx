import {
  FileText,
  Table,
  List,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimelineView } from "./components/TimelineView";
import { TableView } from "./components/TableView";
import { ListView } from "./components/ListView";
import { CompactView } from "./components/CompactView";
import { useLogStore } from "@/store/useLogStore";

interface Log {
  id: string;
  message: string;
  level: string;
  service: string;
  timestamp: string;
  metadata: Record<string, string>;
  action?: string;
  file?: string;
  func_name?: string;
  projectId: string;
  projectName: string;
}

interface LogSectionProps {
  selectedProject: string;
  isRefreshing: boolean;
}

type ViewMode = "list" | "table" | "timeline" | "compact";

export default function LogSection({ selectedProject, isRefreshing }: LogSectionProps) {
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [bookmarkedLogs, setBookmarkedLogs] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [quickFilter, setQuickFilter] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(["level", "message", "timestamp", "service", "projectName"])
  );

  const ITEMS_PER_PAGE = 10;
  const { logs, isLoading, fetchLogs, setFilter, filters } = useLogStore();

  // Initialize filters and fetch logs only once on mount
  useEffect(() => {
    setFilter("limit", ITEMS_PER_PAGE);
    setFilter("page", 1);
    setFilter("sortOrder", sortOrder);
    setFilter("selectedService", selectedProject);
    fetchLogs();
  }, [selectedProject]);

  useEffect(() => {
    if (filters.sortOrder !== sortOrder) {
      setFilter("sortOrder", sortOrder);
      setFilter("page", 1);
      fetchLogs();
    }
  }, [sortOrder, filters.sortOrder, setFilter, fetchLogs]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && logs.length % ITEMS_PER_PAGE === 0) {
      setFilter("page", filters.page + 1);
      fetchLogs();
    }
  }, [isLoading, logs.length, filters.page, ITEMS_PER_PAGE, setFilter, fetchLogs]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-none px-4 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table className="h-4 w-4 mr-2" />
            Table View
          </Button>
          <Button
            variant={viewMode === "timeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("timeline")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Timeline
          </Button>
          <Button
            variant={viewMode === "compact" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("compact")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Compact
          </Button>
        </div>
      </div>

      {/* Log Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "list" && (
          <ScrollArea 
            key={isRefreshing ? "refresh" : "normal"}
            className="h-full"
          >
            <div className="p-4">
              <ListView
                logs={logs}
                bookmarkedLogs={bookmarkedLogs}
                setSelectedLog={setSelectedLog}
                formatTimestamp={formatTimestamp}
                toggleBookmark={(id) => {
                  const newBookmarks = new Set(bookmarkedLogs);
                  if (bookmarkedLogs.has(id)) {
                    newBookmarks.delete(id);
                  } else {
                    newBookmarks.add(id);
                  }
                  setBookmarkedLogs(newBookmarks);
                }}
                setQuickFilter={setQuickFilter}
                hasMore={logs.length >= ITEMS_PER_PAGE}
                isLoading={isLoading}
                onLoadMore={handleLoadMore}
                isRefreshing={isRefreshing}
              />
            </div>
          </ScrollArea>
        )}
        {viewMode === "table" && (
          <ScrollArea 
            key={isRefreshing ? "refresh" : "normal"}
            className="h-full"
          >
            <div className="p-4">
              <TableView
                logs={logs}
                visibleColumns={visibleColumns}
                formatTimestamp={formatTimestamp}
              />
            </div>
          </ScrollArea>
        )}
        {viewMode === "timeline" && (
          <ScrollArea 
            key={isRefreshing ? "refresh" : "normal"}
            className="h-full"
          >
            <div className="p-4">
              <TimelineView
                logs={logs}
                formatTimestamp={formatTimestamp}
              />
            </div>
          </ScrollArea>
        )}
        {viewMode === "compact" && (
          <ScrollArea 
            key={isRefreshing ? "refresh" : "normal"}
            className="h-full"
          >
            <div className="p-4">
              <CompactView
                logs={logs}
                formatTimestamp={formatTimestamp}
              />
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
