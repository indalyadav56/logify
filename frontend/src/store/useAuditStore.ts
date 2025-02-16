import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.password_change'
  | 'user.two_factor_enabled'
  | 'user.two_factor_disabled'
  | 'team.created'
  | 'team.updated'
  | 'team.deleted'
  | 'team.member_invited'
  | 'team.member_joined'
  | 'team.member_removed'
  | 'team.role_updated'
  | 'team.permissions_updated'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'project.archived'
  | 'project.unarchived'
  | 'webhook.created'
  | 'webhook.updated'
  | 'webhook.deleted'
  | 'webhook.triggered'
  | 'api_key.created'
  | 'api_key.revoked'
  | 'settings.updated';

export type AuditLogLevel = 'info' | 'warning' | 'error';

export interface AuditLog {
  id: string;
  action: AuditAction;
  actor_id: string;
  actor_name: string;
  actor_email: string;
  target_id?: string;
  target_type?: string;
  target_name?: string;
  team_id?: string;
  project_id?: string;
  level: AuditLogLevel;
  description: string;
  metadata: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface AuditState {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  filters: {
    startDate: string | null;
    endDate: string | null;
    actions: AuditAction[];
    levels: AuditLogLevel[];
    actors: string[];
    teams: string[];
    projects: string[];
  };
  fetchLogs: (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    actions?: AuditAction[];
    levels?: AuditLogLevel[];
    actors?: string[];
    teams?: string[];
    projects?: string[];
  }) => Promise<void>;
  exportLogs: (format: 'csv' | 'json') => Promise<void>;
  clearFilters: () => void;
  updateFilters: (filters: Partial<AuditState['filters']>) => void;
}

export const useAuditStore = create<AuditState>()(
  devtools(
    (set, get) => ({
      logs: [],
      isLoading: false,
      error: null,
      totalCount: 0,
      filters: {
        startDate: null,
        endDate: null,
        actions: [],
        levels: [],
        actors: [],
        teams: [],
        projects: [],
      },

      fetchLogs: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
          
          const filters = { ...get().filters, ...params };
          if (filters.startDate) queryParams.append('start_date', filters.startDate);
          if (filters.endDate) queryParams.append('end_date', filters.endDate);
          if (filters.actions.length) queryParams.append('actions', filters.actions.join(','));
          if (filters.levels.length) queryParams.append('levels', filters.levels.join(','));
          if (filters.actors.length) queryParams.append('actors', filters.actors.join(','));
          if (filters.teams.length) queryParams.append('teams', filters.teams.join(','));
          if (filters.projects.length) queryParams.append('projects', filters.projects.join(','));

          const response = await fetch(
            `http://localhost:8080/v1/audit-logs?${queryParams.toString()}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch audit logs');
          }

          const data = await response.json();
          set({
            logs: data.logs,
            totalCount: data.total,
            isLoading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      exportLogs: async (format: 'csv' | 'json') => {
        try {
          const filters = get().filters;
          const queryParams = new URLSearchParams();
          queryParams.append('format', format);
          if (filters.startDate) queryParams.append('start_date', filters.startDate);
          if (filters.endDate) queryParams.append('end_date', filters.endDate);
          if (filters.actions.length) queryParams.append('actions', filters.actions.join(','));
          if (filters.levels.length) queryParams.append('levels', filters.levels.join(','));
          if (filters.actors.length) queryParams.append('actors', filters.actors.join(','));
          if (filters.teams.length) queryParams.append('teams', filters.teams.join(','));
          if (filters.projects.length) queryParams.append('projects', filters.projects.join(','));

          const response = await fetch(
            `http://localhost:8080/v1/audit-logs/export?${queryParams.toString()}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to export audit logs');
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit-logs-${new Date().toISOString()}.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      clearFilters: () => {
        set({
          filters: {
            startDate: null,
            endDate: null,
            actions: [],
            levels: [],
            actors: [],
            teams: [],
            projects: [],
          },
        });
      },

      updateFilters: (filters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...filters,
          },
        }));
      },
    })
  )
);
