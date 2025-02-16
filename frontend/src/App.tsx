import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
  Bookmark,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  Logs,
  Settings2,
  Download,
  FolderClosed,
  Webhook,
  Users,
  ScrollText,
  Upload,
} from "lucide-react";
import { TeamSwitcher } from "./components/team-switcher";
import { NavUser } from "./components/nav-user";
import Loading from "./components/Loading";
import { publicRoutes } from "./routes/public-routes";
import { privateRoutes } from "./routes/private-routes";
import { useAuthStore } from "./store/useAuthStore";

// Navigation items
const navigationItems = [
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
    title: "Import",
    url: "/import",
    icon: Upload,
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

// Teams data
const teamsData = [
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
];

// User data
const userData = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

function AppContent() {
  const location = useLocation();
  const isPublicRoute = ["/", "/auth/login", "/auth/register"].includes(location.pathname);

  return (
    <>
      {!isPublicRoute ? (
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <TeamSwitcher teams={teamsData} />
            </SidebarHeader>

            <SidebarContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton tooltip={item.title} asChild>
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" /> {item.title} 
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
              <div className="flex items-center gap-4">
                <NavUser user={userData} />
              </div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <Suspense fallback={<Loading />}>
              <Routes>
                {privateRoutes}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </Suspense>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <Suspense fallback={<Loading />}>
          <Routes>
            {publicRoutes}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </Suspense>
      )}

      <Toaster position="top-right" />
    </>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
