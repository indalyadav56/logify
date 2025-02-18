import { create } from "zustand";

export interface DocSection {
  id: string;
  title: string;
  description?: string;
  content: string;
  order: number;
  category: "getting-started" | "guides" | "api-reference" | "sdks" | "examples";
}

export interface DocCategory {
  id: string;
  title: string;
  description: string;
  sections: DocSection[];
}

interface DocsStore {
  categories: DocCategory[];
  currentSection: DocSection | null;
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchSection: (sectionId: string) => Promise<void>;
  searchDocs: (query: string) => Promise<DocSection[]>;
}

export const useDocsStore = create<DocsStore>((set, get) => ({
  categories: [],
  currentSection: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("http://localhost:8080/v1/docs/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch documentation categories");
      }

      const data = await response.json();
      set({ categories: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  fetchSection: async (sectionId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        `http://localhost:8080/v1/docs/sections/${sectionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documentation section");
      }

      const data = await response.json();
      set({ currentSection: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  searchDocs: async (query: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        `http://localhost:8080/v1/docs/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search documentation");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
      return [];
    }
  },
}));
