import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type WebhookEventType = 
  | 'log.created'
  | 'log.error'
  | 'log.warning'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'alert.triggered';

export interface WebhookSecret {
  id: string;
  value: string;
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: WebhookEventType;
  status: 'success' | 'failed' | 'pending';
  request_body: string;
  response_body?: string;
  response_status?: number;
  error?: string;
  created_at: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  project_id: string;
  description?: string;
  events: WebhookEventType[];
  active: boolean;
  secret?: WebhookSecret;
  created_at: string;
  updated_at: string;
  last_delivery?: WebhookDelivery;
  headers?: Record<string, string>;
  retry_count?: number;
  timeout?: number;
}

interface WebhookState {
  webhooks: Webhook[];
  deliveries: Record<string, WebhookDelivery[]>;
  isLoading: boolean;
  error: string | null;
  createWebhook: (webhook: Omit<Webhook, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateWebhook: (id: string, updates: Partial<Webhook>) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  toggleWebhook: (id: string) => Promise<void>;
  rotateSecret: (id: string) => Promise<void>;
  fetchDeliveries: (webhookId: string) => Promise<void>;
  retryDelivery: (webhookId: string, deliveryId: string) => Promise<void>;
}

export const useWebhookStore = create<WebhookState>()(
  devtools(
    persist(
      (set, get) => ({
        webhooks: [],
        deliveries: {},
        isLoading: false,
        error: null,

        createWebhook: async (webhook) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('http://localhost:8080/v1/webhooks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(webhook),
            });

            if (!response.ok) {
              throw new Error('Failed to create webhook');
            }

            const newWebhook = await response.json();
            set((state) => ({
              webhooks: [...state.webhooks, newWebhook],
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        updateWebhook: async (id, updates) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`http://localhost:8080/v1/webhooks/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update webhook');
            }

            const updatedWebhook = await response.json();
            set((state) => ({
              webhooks: state.webhooks.map((w) =>
                w.id === id ? { ...w, ...updatedWebhook } : w
              ),
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        deleteWebhook: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`http://localhost:8080/v1/webhooks/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to delete webhook');
            }

            set((state) => ({
              webhooks: state.webhooks.filter((w) => w.id !== id),
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        toggleWebhook: async (id) => {
          const webhook = get().webhooks.find((w) => w.id === id);
          if (webhook) {
            await get().updateWebhook(id, { active: !webhook.active });
          }
        },

        rotateSecret: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`http://localhost:8080/v1/webhooks/${id}/secret/rotate`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to rotate webhook secret');
            }

            const { secret } = await response.json();
            set((state) => ({
              webhooks: state.webhooks.map((w) =>
                w.id === id ? { ...w, secret } : w
              ),
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        fetchDeliveries: async (webhookId) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(
              `http://localhost:8080/v1/webhooks/${webhookId}/deliveries`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error('Failed to fetch webhook deliveries');
            }

            const deliveries = await response.json();
            set((state) => ({
              deliveries: {
                ...state.deliveries,
                [webhookId]: deliveries,
              },
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        retryDelivery: async (webhookId, deliveryId) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(
              `http://localhost:8080/v1/webhooks/${webhookId}/deliveries/${deliveryId}/retry`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error('Failed to retry webhook delivery');
            }

            const newDelivery = await response.json();
            set((state) => ({
              deliveries: {
                ...state.deliveries,
                [webhookId]: [
                  newDelivery,
                  ...(state.deliveries[webhookId] || []),
                ],
              },
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },
      }),
      {
        name: 'logify-webhooks-storage',
      }
    )
  )
);
