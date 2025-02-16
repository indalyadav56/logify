import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Project {
  id: string;
  title: string;
  environment: 'dev' | 'staging' | 'prod';
  description?: string;
  created_at: string;
  updated_at: string;
  logs_count?: number;
  status: 'active' | 'archived';
  team_members?: string[];
  api_keys?: {
    id: string;
    name: string;
    last_used?: string;
    created_at: string;
  }[];
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  archiveProject: (id: string) => Promise<void>;
  generateApiKey: (projectId: string, name: string) => Promise<void>;
  deleteApiKey: (projectId: string, keyId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        projects: [],
        selectedProject: null,
        isLoading: false,
        error: null,

        createProject: async (project) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('http://localhost:8080/v1/projects', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(project),
            });

            if (!response.ok) {
              throw new Error('Failed to create project');
            }

            const newProject = await response.json();
            set((state) => ({
              projects: [...state.projects, newProject],
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        updateProject: async (id, updates) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`http://localhost:8080/v1/projects/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update project');
            }

            const updatedProject = await response.json();
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === id ? { ...p, ...updatedProject } : p
              ),
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        deleteProject: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`http://localhost:8080/v1/projects/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to delete project');
            }

            set((state) => ({
              projects: state.projects.filter((p) => p.id !== id),
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        setSelectedProject: (project) => {
          set({ selectedProject: project });
        },

        archiveProject: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`http://localhost:8080/v1/projects/${id}/archive`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to archive project');
            }

            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === id ? { ...p, status: 'archived' } : p
              ),
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        generateApiKey: async (projectId, name) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`http://localhost:8080/v1/projects/${projectId}/api-keys`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({ name }),
            });

            if (!response.ok) {
              throw new Error('Failed to generate API key');
            }

            const newKey = await response.json();
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId
                  ? {
                      ...p,
                      api_keys: [...(p.api_keys || []), newKey],
                    }
                  : p
              ),
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        deleteApiKey: async (projectId, keyId) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(
              `http://localhost:8080/v1/projects/${projectId}/api-keys/${keyId}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error('Failed to delete API key');
            }

            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId
                  ? {
                      ...p,
                      api_keys: p.api_keys?.filter((k) => k.id !== keyId),
                    }
                  : p
              ),
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },
      }),
      {
        name: 'logify-projects-storage',
      }
    )
  )
);
