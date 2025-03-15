import { useNotificationStore } from "@/store/useNotificationStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { NotificationCard } from "./notification-card";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";

export function NotificationPopover() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    fetchNotifications,
    isLoading,
  } = useNotificationStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-1 h-5 min-w-[20px] px-1"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96" align="end">
        <div className="flex items-center justify-between pb-4">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(80vh-100px)] md:h-[400px]">
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
