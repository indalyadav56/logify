import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type NotificationPriority = 'low' | 'medium' | 'high';
export type NotificationType = 'error' | 'warning' | 'info' | 'success';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  project_id?: string;
  created_at: string;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    persist(
      (set, get) => ({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: null,

        addNotification: (notification) => {
          const newNotification = {
            ...notification,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            read: false,
          };
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        },

        markAsRead: (id) => {
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            if (notification && !notification.read) {
              return {
                notifications: state.notifications.map((n) =>
                  n.id === id ? { ...n, read: true } : n
                ),
                unreadCount: state.unreadCount - 1,
              };
            }
            return state;
          });
        },

        markAllAsRead: () => {
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }));
        },

        deleteNotification: (id) => {
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unreadCount: notification && !notification.read
                ? state.unreadCount - 1
                : state.unreadCount,
            };
          });
        },

        clearAllNotifications: () => {
          set({ notifications: [], unreadCount: 0 });
        },

        fetchNotifications: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('http://localhost:8080/v1/notifications', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            const unreadCount = data.filter((n: Notification) => !n.read).length;

            set({
              notifications: data,
              unreadCount,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: (error as Error).message,
              isLoading: false,
            });
          }
        },
      }),
      {
        name: 'logify-notifications-storage',
      }
    )
  )
);
