import { useNotificationStore, Notification } from "@/store/useNotificationStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, Trash2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface NotificationCardProps {
  notification: Notification;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const { markAsRead, deleteNotification } = useNotificationStore();
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case "high":
        return "border-l-destructive";
      case "medium":
        return "border-l-warning";
      default:
        return "border-l-primary";
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <Card
      className={cn(
        "flex items-start p-4 border-l-4 transition-colors hover:bg-muted/50 cursor-pointer",
        getPriorityColor(),
        !notification.read && "bg-muted/30"
      )}
      onClick={handleClick}
    >
      <div className="mr-4 mt-1">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium leading-none">
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mr-2 -mt-2"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </span>
          {notification.project_id && (
            <>
              <span>•</span>
              <span>Project: {notification.project_id}</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
