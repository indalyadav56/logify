import { Suspense, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
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
  SidebarGroup,
} from "./components/ui/sidebar";
import { Toaster } from "sonner";
import {
  BarChart,
  Bell,
  Bookmark,
  GalleryVerticalEnd,
  LayoutDashboard,
  Logs,
  Settings2,
  Download,
  Webhook,
  Users,
  ScrollText,
  Upload,
  CreditCard,
  BookOpen,
} from "lucide-react";
import Loading from "./components/Loading";
import { publicRoutes } from "./routes/public-routes";
import { privateRoutes } from "./routes/private-routes";
import { Collapsible } from "./components/ui/collapsible";
import { useProjectStore } from "./store/useProjectStore";
import { useUserStore } from "./store/useUserStore";
import SideBarUser from "./components/SideBarUser";

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Logs",
    icon: Logs,
    href: "/logs",
  },
  {
    title: "Projects",
    icon: GalleryVerticalEnd,
    href: "/projects",
  },
  {
    title: "Alerts",
    icon: Bell,
    href: "/alerts",
  },
  {
    title: "Billing",
    icon: CreditCard,
    href: "/billing",
  },
  {
    title: "Documentation",
    icon: BookOpen,
    href: "/docs",
  },
  {
    title: "Analytics",
    icon: BarChart,
    href: "/analytics",
  },
  {
    title: "Import",
    icon: Upload,
    href: "/import",
  },
  {
    title: "Export",
    icon: Download,
    href: "/export",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    title: "Webhooks",
    icon: Webhook,
    href: "/webhooks",
  },
  {
    title: "Audit Logs",
    icon: ScrollText,
    href: "/audit",
  },
  {
    title: "Settings",
    icon: Settings2,
    href: "/settings",
  },
];

function AppContent() {
  const location = useLocation();
  const isPublicRoute = ["/", "/auth/login", "/auth/register"].includes(
    location.pathname
  );
  const { projects, fetchProjects } = useProjectStore();
  const { user, isLoading, error, fetchCurrentUser } = useUserStore();

  useEffect(() => {
    fetchCurrentUser();
    fetchProjects();
  }, []);

  return (
    <>
      {!isPublicRoute ? (
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem className="text-center">
                  <span className="p-2 font-bold font-mono text-lg">
                    LOGIFY
                  </span>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <Collapsible
                      asChild
                      defaultOpen={true}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton tooltip={item.title} asChild>
                          <a href={item.href}>
                            <item.icon className="h-4 w-4" /> {item.title}
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </Collapsible>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <div className="flex items-center gap-4">
                <SideBarUser user={user} />
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <Suspense fallback={<Loading />}>
              <div className="p-6 h-screen w-full overflow-hidden">
                <Routes>
                  {privateRoutes}
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </div>
            </Suspense>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <Suspense fallback={<Loading />}>
          <Routes>
            {publicRoutes}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      )}
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
