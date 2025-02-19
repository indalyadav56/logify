import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("http://localhost:8080/v1/users/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDAwNjQ5NzUsInRlbmFudF9pZCI6ImQ5YmRmYzA2LWFjMWItNDE1OS04NWVhLTEzZjg1YTYyYjc0NCIsInVzZXJfaWQiOiJkY2ZmMTYxYy1iOGJlLTRkYjUtYmIzMy1hYzYwZTE1ZjQzODIifQ.-Ugxo4glOOA1x6fgxxUsC6htDu2h-J9GXwqPzswtIBA`,
          // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      set({ user: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },
}));
