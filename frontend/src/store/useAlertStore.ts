import { create } from "zustand";

export interface Alert {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  type: "error" | "warning" | "info";
  condition: {
    metric: "error_rate" | "log_volume" | "latency" | "storage";
    operator: ">" | "<" | "==" | ">=";
    value: number;
    duration: string; // e.g., "5m", "1h", "24h"
  };
  channels: {
    type: "email" | "slack" | "webhook";
    config: Record<string, any>;
  }[];
  status: "active" | "inactive" | "triggered";
  created_at: string;
  updated_at: string;
  last_triggered?: string;
}

interface AlertStore {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  fetchAlerts: (projectId: string) => Promise<void>;
  createAlert: (projectId: string, alert: Omit<Alert, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateAlert: (projectId: string, alertId: string, alert: Partial<Alert>) => Promise<void>;
  deleteAlert: (projectId: string, alertId: string) => Promise<void>;
  toggleAlertStatus: (projectId: string, alertId: string) => Promise<void>;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,

  fetchAlerts: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`http://localhost:8080/v1/projects/${projectId}/alerts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();
      set({ alerts: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  createAlert: async (projectId: string, alert) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`http://localhost:8080/v1/projects/${projectId}/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(alert),
      });

      if (!response.ok) {
        throw new Error("Failed to create alert");
      }

      const data = await response.json();
      set((state) => ({
        alerts: [...state.alerts, data],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  updateAlert: async (projectId: string, alertId: string, alert) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        `http://localhost:8080/v1/projects/${projectId}/alerts/${alertId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(alert),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update alert");
      }

      const data = await response.json();
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === alertId ? data : a)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  deleteAlert: async (projectId: string, alertId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        `http://localhost:8080/v1/projects/${projectId}/alerts/${alertId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete alert");
      }

      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== alertId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  toggleAlertStatus: async (projectId: string, alertId: string) => {
    const alert = get().alerts.find((a) => a.id === alertId);
    if (!alert) return;

    const newStatus = alert.status === "active" ? "inactive" : "active";
    await get().updateAlert(projectId, alertId, { status: newStatus });
  },
}));
