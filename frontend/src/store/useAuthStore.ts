import { create } from "zustand";

interface User {
  user_id: string;
  email: string;
}

interface AuthResponse {
  data: {
    user_id: string;
    email: string;
    token: {
      access_token: string;
    };
  };
  message: string;
  status_code: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Initialize auth state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem("token");
  return {
    user: null,
    token,
    isAuthenticated: Boolean(token),
    isLoading: false,
    error: null,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log("Attempting login with:", { email });
      
      const response = await fetch("http://localhost:8080/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        // credentials: "include", // Include cookies in the request
      });

      const responseData = await response.json();
      console.log("Login response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || "Login failed");
      }

      // Check if response has the expected structure
      if (!responseData.data?.token?.access_token) {
        console.error("Unexpected response structure:", responseData);
        throw new Error("Invalid response from server");
      }

      const { data } = responseData;
      
      set({
        user: {
          user_id: data.user_id,
          email: data.email,
        },
        token: data.token.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Store token in localStorage for persistence
      localStorage.setItem("token", data.token.access_token);
      
      console.log("Login successful:", {
        user_id: data.user_id,
        email: data.email,
        isAuthenticated: true
      });
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      set({
        user: null,
        token: null,
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
