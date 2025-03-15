import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export type ProjectPermission = 
  | 'view_logs'
  | 'create_logs'
  | 'delete_logs'
  | 'manage_webhooks'
  | 'manage_alerts'
  | 'manage_members'
  | 'manage_settings'
  | 'view_analytics';

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: TeamRole;
  avatar_url?: string;
  project_permissions: Record<string, ProjectPermission[]>;
  status: 'active' | 'pending' | 'disabled';
  joined_at: string;
  invited_by: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  members: TeamMember[];
  projects: string[];
  created_at: string;
  updated_at: string;
  settings: {
    allow_member_invites: boolean;
    require_admin_approval: boolean;
    default_member_permissions: ProjectPermission[];
  };
}

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  error: string | null;
  createTeam: (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  inviteMember: (teamId: string, email: string, role: TeamRole, projectPermissions: Record<string, ProjectPermission[]>) => Promise<void>;
  updateMemberRole: (teamId: string, memberId: string, role: TeamRole) => Promise<void>;
  updateMemberPermissions: (teamId: string, memberId: string, projectId: string, permissions: ProjectPermission[]) => Promise<void>;
  removeMember: (teamId: string, memberId: string) => Promise<void>;
  setCurrentTeam: (teamId: string) => void;
  fetchTeams: () => Promise<void>;
}

export const useTeamStore = create<TeamState>()(
  devtools(
    persist(
      (set, get) => ({
        teams: [],
        currentTeam: null,
        isLoading: false,
        error: null,

        createTeam: async (team) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('http://localhost:8080/v1/teams', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(team),
            });

            if (!response.ok) {
              throw new Error('Failed to create team');
            }

            const newTeam = await response.json();
            set((state) => ({
              teams: [...state.teams, newTeam],
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        updateTeam: async (id, updates) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`http://localhost:8080/v1/teams/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update team');
            }

            const updatedTeam = await response.json();
            set((state) => ({
              teams: state.teams.map((t) => (t.id === id ? updatedTeam : t)),
              currentTeam: state.currentTeam?.id === id ? updatedTeam : state.currentTeam,
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        deleteTeam: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`http://localhost:8080/v1/teams/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to delete team');
            }

            set((state) => ({
              teams: state.teams.filter((t) => t.id !== id),
              currentTeam: state.currentTeam?.id === id ? null : state.currentTeam,
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        inviteMember: async (teamId, email, role, projectPermissions) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`http://localhost:8080/v1/teams/${teamId}/invites`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({ email, role, project_permissions: projectPermissions }),
            });

            if (!response.ok) {
              throw new Error('Failed to invite member');
            }

            const { member } = await response.json();
            set((state) => ({
              teams: state.teams.map((t) =>
                t.id === teamId
                  ? { ...t, members: [...t.members, member] }
                  : t
              ),
              currentTeam:
                state.currentTeam?.id === teamId
                  ? { ...state.currentTeam, members: [...state.currentTeam.members, member] }
                  : state.currentTeam,
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        updateMemberRole: async (teamId, memberId, role) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(
              `http://localhost:8080/v1/teams/${teamId}/members/${memberId}/role`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ role }),
              }
            );

            if (!response.ok) {
              throw new Error('Failed to update member role');
            }

            set((state) => ({
              teams: state.teams.map((t) =>
                t.id === teamId
                  ? {
                      ...t,
                      members: t.members.map((m) =>
                        m.id === memberId ? { ...m, role } : m
                      ),
                    }
                  : t
              ),
              currentTeam:
                state.currentTeam?.id === teamId
                  ? {
                      ...state.currentTeam,
                      members: state.currentTeam.members.map((m) =>
                        m.id === memberId ? { ...m, role } : m
                      ),
                    }
                  : state.currentTeam,
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        updateMemberPermissions: async (teamId, memberId, projectId, permissions) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(
              `http://localhost:8080/v1/teams/${teamId}/members/${memberId}/permissions`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ project_id: projectId, permissions }),
              }
            );

            if (!response.ok) {
              throw new Error('Failed to update member permissions');
            }

            set((state) => ({
              teams: state.teams.map((t) =>
                t.id === teamId
                  ? {
                      ...t,
                      members: t.members.map((m) =>
                        m.id === memberId
                          ? {
                              ...m,
                              project_permissions: {
                                ...m.project_permissions,
                                [projectId]: permissions,
                              },
                            }
                          : m
                      ),
                    }
                  : t
              ),
              currentTeam:
                state.currentTeam?.id === teamId
                  ? {
                      ...state.currentTeam,
                      members: state.currentTeam.members.map((m) =>
                        m.id === memberId
                          ? {
                              ...m,
                              project_permissions: {
                                ...m.project_permissions,
                                [projectId]: permissions,
                              },
                            }
                          : m
                      ),
                    }
                  : state.currentTeam,
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        removeMember: async (teamId, memberId) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(
              `http://localhost:8080/v1/teams/${teamId}/members/${memberId}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error('Failed to remove member');
            }

            set((state) => ({
              teams: state.teams.map((t) =>
                t.id === teamId
                  ? {
                      ...t,
                      members: t.members.filter((m) => m.id !== memberId),
                    }
                  : t
              ),
              currentTeam:
                state.currentTeam?.id === teamId
                  ? {
                      ...state.currentTeam,
                      members: state.currentTeam.members.filter(
                        (m) => m.id !== memberId
                      ),
                    }
                  : state.currentTeam,
              isLoading: false,
            }));
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },

        setCurrentTeam: (teamId) => {
          const team = get().teams.find((t) => t.id === teamId);
          if (team) {
            set({ currentTeam: team });
          }
        },

        fetchTeams: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('http://localhost:8080/v1/teams', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to fetch teams');
            }

            const teams = await response.json();
            set({
              teams,
              currentTeam: teams[0] || null,
              isLoading: false,
            });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },
      }),
      {
        name: 'logify-teams-storage',
      }
    )
  )
);
