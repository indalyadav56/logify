import { useAuditStore, AuditAction, AuditLogLevel } from "@/store/useAuditStore";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

const AUDIT_ACTIONS: { value: AuditAction; label: string }[] = [
  { value: "team.created", label: "Team Created" },
  { value: "team.updated", label: "Team Updated" },
  { value: "team.deleted", label: "Team Deleted" },
  { value: "team.member_invited", label: "Member Invited" },
  { value: "team.member_joined", label: "Member Joined" },
  { value: "team.member_removed", label: "Member Removed" },
  { value: "team.role_updated", label: "Role Updated" },
  { value: "team.permissions_updated", label: "Permissions Updated" },
  { value: "project.created", label: "Project Created" },
  { value: "project.updated", label: "Project Updated" },
  { value: "project.deleted", label: "Project Deleted" },
  { value: "webhook.created", label: "Webhook Created" },
  { value: "webhook.updated", label: "Webhook Updated" },
  { value: "webhook.deleted", label: "Webhook Deleted" },
];

const AUDIT_LEVELS: { value: AuditLogLevel; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

export function AuditFilters() {
  const { filters, updateFilters, clearFilters, fetchLogs } = useAuditStore();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: filters.startDate ? new Date(filters.startDate) : undefined,
    to: filters.endDate ? new Date(filters.endDate) : undefined,
  });

  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      updateFilters({
        startDate: dateRange.from?.toISOString() || null,
        endDate: dateRange.to?.toISOString() || null,
      });
    }
  }, [dateRange, updateFilters]);

  const handleActionToggle = (action: AuditAction) => {
    const newActions = filters.actions.includes(action)
      ? filters.actions.filter((a) => a !== action)
      : [...filters.actions, action];
    updateFilters({ actions: newActions });
  };

  const handleLevelToggle = (level: AuditLogLevel) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter((l) => l !== level)
      : [...filters.levels, level];
    updateFilters({ levels: newLevels });
  };

  const handleClearFilters = () => {
    clearFilters();
    setDateRange({ from: undefined, to: undefined });
  };

  const handleApplyFilters = () => {
    fetchLogs();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Date Range */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Actions */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start font-normal">
              Actions ({filters.actions.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <Command>
              <CommandInput placeholder="Search actions..." />
              <CommandEmpty>No actions found.</CommandEmpty>
              <CommandGroup>
                {AUDIT_ACTIONS.map((action) => (
                  <CommandItem
                    key={action.value}
                    onSelect={() => handleActionToggle(action.value)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{action.label}</span>
                      {filters.actions.includes(action.value) && (
                        <Badge>Selected</Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Levels */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start font-normal">
              Levels ({filters.levels.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <Command>
              <CommandGroup>
                {AUDIT_LEVELS.map((level) => (
                  <CommandItem
                    key={level.value}
                    onSelect={() => handleLevelToggle(level.value)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{level.label}</span>
                      {filters.levels.includes(level.value) && (
                        <Badge>Selected</Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {(filters.actions.length > 0 ||
          filters.levels.length > 0 ||
          dateRange.from ||
          dateRange.to) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFilters}
            className="h-9 w-9"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected Filters */}
      <div className="flex flex-wrap gap-2">
        {dateRange.from && (
          <Badge variant="secondary">
            Date: {format(dateRange.from, "LLL dd, y")}
            {dateRange.to && ` - ${format(dateRange.to, "LLL dd, y")}`}
          </Badge>
        )}
        {filters.actions.map((action) => (
          <Badge
            key={action}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleActionToggle(action)}
          >
            {AUDIT_ACTIONS.find((a) => a.value === action)?.label}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}
        {filters.levels.map((level) => (
          <Badge
            key={level}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleLevelToggle(level)}
          >
            {AUDIT_LEVELS.find((l) => l.value === level)?.label}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}
      </div>

      {/* Apply Filters */}
      <div className="flex justify-end">
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
}
