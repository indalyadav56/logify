import { useNotificationStore } from "@/store/useNotificationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationCard } from "@/components/notifications/notification-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAllNotifications,
    fetchNotifications,
    isLoading,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Manage your notifications and alerts.
          </p>
        </div>
        <div className="space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAllNotifications}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-0 pb-4">
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unread" className="space-y-4">
            <TabsList>
              <TabsTrigger value="unread">
                Unread ({unreadNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="read">
                Read ({readNotifications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  Loading notifications...
                </div>
              ) : unreadNotifications.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No unread notifications
                </div>
              ) : (
                <div className="space-y-2">
                  {unreadNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="read" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  Loading notifications...
                </div>
              ) : readNotifications.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No read notifications
                </div>
              ) : (
                <div className="space-y-2">
                  {readNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
