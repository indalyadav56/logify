import { create } from "zustand";

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  limits: {
    storage_gb: number;
    projects: number;
    team_members: number;
    retention_days: number;
  };
}

export interface Invoice {
  id: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  date: string;
  pdf_url: string;
}

export interface Usage {
  storage_used_gb: number;
  projects_count: number;
  team_members_count: number;
  current_retention_days: number;
}

interface BillingStore {
  currentPlan: BillingPlan | null;
  availablePlans: BillingPlan[];
  invoices: Invoice[];
  usage: Usage | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentPlan: () => Promise<void>;
  fetchAvailablePlans: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchUsage: () => Promise<void>;
  updateSubscription: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

export const useBillingStore = create<BillingStore>((set, _) => ({
  currentPlan: null,
  availablePlans: [],
  invoices: [],
  usage: null,
  isLoading: false,
  error: null,

  fetchCurrentPlan: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        "http://localhost:8080/v1/billing/subscription",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch current plan");
      }

      const data = await response.json();
      set({ currentPlan: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  fetchAvailablePlans: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("http://localhost:8080/v1/billing/plans", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available plans");
      }

      const data = await response.json();
      set({ availablePlans: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  fetchInvoices: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        "http://localhost:8080/v1/billing/invoices",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      set({ invoices: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  fetchUsage: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("http://localhost:8080/v1/billing/usage", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch usage");
      }

      const data = await response.json();
      set({ usage: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  updateSubscription: async (planId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        "http://localhost:8080/v1/billing/subscription",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ plan_id: planId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }

      const data = await response.json();
      set({ currentPlan: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  cancelSubscription: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        "http://localhost:8080/v1/billing/subscription",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      set({ currentPlan: null, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },
}));
