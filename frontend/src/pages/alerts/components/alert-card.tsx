import { Alert } from "@/store/useAlertStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Bell,
  BellOff,
  Clock,
  Edit,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useAlertStore } from "@/store/useAlertStore";
import { useState } from "react";
import { EditAlertDialog } from "./edit-alert-dialog";

interface AlertCardProps {
  alert: Alert;
  projectId: string;
}

export function AlertCard({ alert, projectId }: AlertCardProps) {
  const { toggleAlertStatus, deleteAlert } = useAlertStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getStatusColor = (status: Alert["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "triggered":
        return "bg-red-500";
      case "inactive":
        return "bg-gray-500";
    }
  };

  const getMetricIcon = (metric: Alert["condition"]["metric"]) => {
    switch (metric) {
      case "error_rate":
        return <AlertCircle className="h-4 w-4" />;
      case "log_volume":
        return <Bell className="h-4 w-4" />;
      case "latency":
        return <Clock className="h-4 w-4" />;
      case "storage":
        return <BellOff className="h-4 w-4" />;
    }
  };

  const formatDuration = (duration: string) => {
    const value = duration.slice(0, -1);
    const unit = duration.slice(-1);
    const units: Record<string, string> = {
      m: "minute",
      h: "hour",
      d: "day",
    };
    return `${value} ${units[unit]}${Number(value) > 1 ? "s" : ""}`;
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{alert.name}</h3>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(
                    alert.status
                  )} text-white border-0`}
                >
                  {alert.status}
                </Badge>
              </div>
              {alert.description && (
                <p className="text-sm text-muted-foreground">
                  {alert.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={alert.status === "active"}
                onCheckedChange={() => toggleAlertStatus(projectId, alert.id)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteAlert(projectId, alert.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getMetricIcon(alert.condition.metric)}
                <span className="capitalize">
                  {alert.condition.metric.replace("_", " ")}
                </span>
              </div>
              <p className="font-medium">
                {alert.condition.operator} {alert.condition.value}
                {alert.condition.metric === "error_rate" && "%"}
                {alert.condition.metric === "latency" && "ms"}
                {alert.condition.metric === "storage" && "GB"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">
                {formatDuration(alert.condition.duration)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {alert.channels.map((channel, index) => (
                <Badge key={index} variant="secondary">
                  {channel.type}
                </Badge>
              ))}
            </div>
          </div>

          {alert.last_triggered && (
            <div className="mt-4 text-sm text-muted-foreground">
              Last triggered:{" "}
              {new Date(alert.last_triggered).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      <EditAlertDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        alert={alert}
        projectId={projectId}
      />
    </>
  );
}
