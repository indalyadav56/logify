export type Role = 'admin' | 'manager' | 'user' | 'read-only';

export interface MenuItem {
  title: string;
  icon: string;
  route: string;
  roles: Role[];
  children?: MenuItem[];
}

export const getProjectMenus = (projectId: string): MenuItem[] => [
  {
    title: "Overview",
    icon: "dashboard",
    route: `/projects/${projectId}/overview`,
    roles: ["admin", "manager", "user", "read-only"]
  },
  {
    title: "Logs",
    icon: "logs",
    route: `/projects/${projectId}/logs`,
    roles: ["admin", "manager", "user", "read-only"],
    children: [
      {
        title: "View Logs",
        route: `/projects/${projectId}/logs/view`,
        roles: ["admin", "manager", "user", "read-only"]
      },
      {
        title: "Export Logs",
        route: `/projects/${projectId}/logs/export`,
        roles: ["admin", "manager"]
      },
      {
        title: "Bookmark Logs",
        route: `/projects/${projectId}/logs/bookmark`,
        roles: ["admin", "user"]
      }
    ]
  },
  {
    title: "Settings",
    icon: "settings",
    route: `/projects/${projectId}/settings`,
    roles: ["admin", "manager"]
  }
];

export const mainMenus: MenuItem[] = [
  {
    title: "Dashboard",
    icon: "dashboard",
    route: "/dashboard",
    roles: ["admin", "manager", "user", "read-only"]
  },
  {
    title: "Projects",
    icon: "folder",
    route: "/projects",
    roles: ["admin", "manager", "user", "read-only"]
  },
  {
    title: "User Management",
    icon: "users",
    route: "/users",
    roles: ["admin"]
  },
  {
    title: "Settings",
    icon: "settings",
    route: "/settings",
    roles: ["admin", "manager"]
  }
];
