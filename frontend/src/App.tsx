import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent,
  Sidebar,
  SidebarMenu,
  SidebarHeader,
  SidebarFooter,
} from "./components/ui/sidebar";
import { Toaster } from "sonner";
import {
  AudioWaveform,
  BarChart,
  Bell,
  BookOpen,
  Bot,
  Bookmark,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Logs,
  PieChart,
  Settings2,
  SquareTerminal,
  Download,
  FolderClosed,
  Webhook,
  Users,
  ScrollText,
} from "lucide-react";
import { TeamSwitcher } from "./components/team-switcher";
import { NavUser } from "./components/nav-user";
// import { NotificationPopover } from "./components/notification-popover";
// import { ThemeToggle } from "./components/theme-toggle";

// Lazy loaded components
const LogPage = lazy(() => import("@/pages/explorer/Logs"));
const ExamplePage = lazy(() => import("@/pages/example"));
const LoginPage = lazy(() => import("@/pages/auth/Login"));
const RegisterPage = lazy(() => import("@/pages/auth/Register"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const AnalyticsPage = lazy(() => import("@/pages/analytics"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const ExportPage = lazy(() => import("@/pages/export"));
const BookmarksPage = lazy(() => import("@/pages/bookmarks"));
const ProjectsPage = lazy(() => import("@/pages/projects"));
const NotificationsPage = lazy(() => import("@/pages/notifications"));
const WebhooksPage = lazy(() => import("@/pages/webhooks"));
const TeamsPage = lazy(() => import("@/pages/teams"));
const AuditPage = lazy(() => import("@/pages/audit"));
const LandingPage = lazy(() => import("@/pages/landing/LandingPage"));

// Loading component for Suspense fallback
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

const nav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Logs",
    url: "/logs",
    icon: Logs,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart,
  },
  {
    title: "Export",
    url: "/export",
    icon: Download,
  },
  {
    title: "Bookmarks",
    url: "/bookmarks",
    icon: Bookmark,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderClosed,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Webhooks",
    url: "/webhooks",
    icon: Webhook,
  },
  {
    title: "Teams",
    url: "/teams",
    icon: Users,
  },
  {
    title: "Audit Logs",
    url: "/audit",
    icon: ScrollText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
  },
];

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <TeamSwitcher teams={data.teams} />
            </SidebarHeader>

            <SidebarContent>
              <SidebarMenu>
                {nav.map((item) => (
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip={item.title} asChild>
                      <a href={item.url}>
                        <item.icon /> {item.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

            </SidebarContent>

            <SidebarFooter>
              <div className="flex items-center gap-4">
                {/* <ThemeToggle /> */}
                {/* <NotificationPopover /> */}
                <NavUser user={data.user} />
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <SidebarInset>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/home" element={<LandingPage />} />
                <Route path="/" element={<LogPage />} />
                <Route path="/example" element={<ExamplePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/webhooks" element={<WebhooksPage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </SidebarInset>
        </SidebarProvider>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
