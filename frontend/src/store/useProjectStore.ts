import { create } from "zustand";

interface Project {
  id: string;
  name: string;
  user_id: string;
  tenant_id: string;
  environment: string;
  api_key: string;
}

interface ProjectResponse {
  data: Project[];
  message: string;
  status_code: number;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  setSelectedProject: (project: Project) => void;
  createProject: (project: Partial<Project>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("http://localhost:8080/v1/projects", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data: ProjectResponse = await response.json();
      set({ projects: data.data, isLoading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  setSelectedProject: (project) => {
    set({ selectedProject: project });
  },

  createProject: async (project) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("http://localhost:8080/v1/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const data = await response.json();
      set((state) => ({
        projects: [...state.projects, data.data],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  updateProject: async (id, project) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`http://localhost:8080/v1/projects/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const data = await response.json();
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...data.data } : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`http://localhost:8080/v1/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
