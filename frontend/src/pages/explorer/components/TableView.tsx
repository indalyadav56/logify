import { Log } from "@/types/log";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface TableViewProps {
  logs: Log[];
  formatTimestamp: (timestamp: string) => string;
  visibleColumns?: Set<string>;
  onSort?: (column: string) => void;
  onToggleColumn?: (column: string) => void;
}

export function TableView({
  logs,
  formatTimestamp,
  visibleColumns = new Set(["level", "message", "timestamp", "service"]),
  onSort,
  onToggleColumn,
}: TableViewProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState("");

  const filteredLogs = logs.filter((log) =>
    Object.values(log).some((value) =>
      String(value).toLowerCase().includes(filterText.toLowerCase())
    )
  );

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredLogs.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredLogs.map((log) => log.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter logs..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Checkbox
                checked={visibleColumns.has("level")}
                onCheckedChange={() => onToggleColumn?.("level")}
                className="mr-2"
              />
              Level
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Checkbox
                checked={visibleColumns.has("message")}
                onCheckedChange={() => onToggleColumn?.("message")}
                className="mr-2"
              />
              Message
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Checkbox
                checked={visibleColumns.has("timestamp")}
                onCheckedChange={() => onToggleColumn?.("timestamp")}
                className="mr-2"
              />
              Timestamp
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Checkbox
                checked={visibleColumns.has("service")}
                onCheckedChange={() => onToggleColumn?.("service")}
                className="mr-2"
              />
              Service
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === filteredLogs.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              {visibleColumns.has("level") && (
                <TableHead>
                  <Button variant="ghost" className="h-8 p-0" onClick={() => onSort?.("level")}>
                    Level
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.has("message") && (
                <TableHead>
                  <Button variant="ghost" className="h-8 p-0" onClick={() => onSort?.("message")}>
                    Message
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.has("timestamp") && (
                <TableHead>
                  <Button variant="ghost" className="h-8 p-0" onClick={() => onSort?.("timestamp")}>
                    Timestamp
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.has("service") && (
                <TableHead>
                  <Button variant="ghost" className="h-8 p-0" onClick={() => onSort?.("service")}>
                    Service
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className={selectedRows.has(log.id) ? "bg-muted/50" : ""}>
                <TableCell className="w-12">
                  <Checkbox
                    checked={selectedRows.has(log.id)}
                    onCheckedChange={() => toggleSelectRow(log.id)}
                    aria-label={`Select log ${log.id}`}
                  />
                </TableCell>
                {visibleColumns.has("level") && (
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${log.level === 'error' ? 'bg-destructive/20 text-destructive' :
                        log.level === 'warn' ? 'bg-warning/20 text-warning' :
                        log.level === 'info' ? 'bg-info/20 text-info' :
                        'bg-muted text-muted-foreground'}`}>
                      {log.level}
                    </div>
                  </TableCell>
                )}
                {visibleColumns.has("message") && (
                  <TableCell className="font-medium">{log.message}</TableCell>
                )}
                {visibleColumns.has("timestamp") && (
                  <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                )}
                {visibleColumns.has("service") && (
                  <TableCell>{log.service}</TableCell>
                )}
                <TableCell className="w-12">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Copy Log</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {selectedRows.size} of {filteredLogs.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Previous */}}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Next */}}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
