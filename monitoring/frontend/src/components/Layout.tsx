import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search as SearchIcon,
  Bell,
  BarChart2,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  Menu,
  ChevronLeft,
  LogOut,
  User,
  Shield,
  Brain,
  Wand2,
  Users,
  Plus,
  LifeBuoy,
  CreditCard,
  UserPlus,
  Mail,
  Github,
  AlertCircle,
  CheckCircle,
  Clock,
  Cloud,
  Webhook,
  Activity,
  Box,
  Container,
  AlertTriangle,
  TrendingUp,
  Code,
  Package,
  Terminal,
  ScrollText,
  CheckSquare,
  Settings,
  LayoutGrid,
  Key,
  Server,
  GitBranch,
  Network,
  Compliance,
  BookOpen,
  FolderOpen,
  History,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useProject } from '@/context/ProjectContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  collapsed?: boolean;
  category: string;
}

const NavItem = ({
  to,
  icon,
  label,
  isActive,
  collapsed,
  category,
}: NavItemProps) => (
  <Link to={to} className="w-full">
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2",
        isActive && "bg-muted",
        collapsed ? "px-2" : "px-4"
      )}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Button>
  </Link>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const { currentProject, projects, currentEnvironment, setCurrentProject, setCurrentEnvironment } = useProject();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    // Core Features
    {
      to: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      category: "main",
    },
    {
      to: "/explorer",
      icon: <SearchIcon size={20} />,
      label: "Log Explorer",
      category: "main",
    },
    {
      to: "/analytics",
      icon: <BarChart2 size={20} />,
      label: "Analytics",
      category: "main",
    },
    {
      to: "/alerts",
      icon: <Bell size={20} />,
      label: "Alerts",
      category: "main",
    },
    {
      to: "/metrics",
      icon: <Activity size={20} />,
      label: "Metrics",
      category: "main",
    },
    {
      to: "/reports",
      icon: <FileText size={20} />,
      label: "Reports",
      category: "main",
    },

    // Data Sources
    {
      to: "/s3-import",
      icon: <Cloud size={20} />,
      label: "S3 Import",
      category: "data",
    },
    {
      to: "/log-import",
      icon: <FileText size={20} />,
      label: "Log Import",
      category: "data",
    },
    {
      to: "/kubernetes",
      icon: <Box size={20} />,
      label: "Kubernetes",
      category: "data",
    },
    {
      to: "/docker",
      icon: <Container size={20} />,
      label: "Docker",
      category: "data",
    },

    // AI & Automation
    {
      to: "/ai-analytics",
      icon: <Brain size={20} />,
      label: "AI Analytics",
      category: "ai",
    },
    {
      to: "/webhooks",
      icon: <Webhook size={20} />,
      label: "Webhooks",
      category: "ai",
    },
    {
      to: "/anomaly-detection",
      icon: <AlertTriangle size={20} />,
      label: "Anomaly Detection",
      category: "ai",
    },
    {
      to: "/predictive-analytics",
      icon: <TrendingUp size={20} />,
      label: "Predictive Analytics",
      category: "ai",
    },
    {
      to: "/ai-insights",
      icon: <Brain size={20} />,
      label: "AI Insights",
      category: "ai",
    },
    {
      to: "/automation",
      icon: <Wand2 size={20} />,
      label: "Automation Rules",
      category: "ai",
    },
    {
      to: "/ml-analytics",
      icon: <Brain size={20} />,
      label: "ML Analytics",
      category: "ai",
    },
    {
      to: "/workflows",
      icon: <GitBranch size={20} />,
      label: "Workflows",
      category: "automation",
    },

    // Development
    {
      to: "/api-playground",
      icon: <Code size={20} />,
      label: "API Playground",
      category: "dev",
    },
    {
      to: "/sdks",
      icon: <Package size={20} />,
      label: "SDKs",
      category: "dev",
    },
    {
      to: "/debug-console",
      icon: <Terminal size={20} />,
      label: "Debug Console",
      category: "dev",
    },

    // Security & Compliance
    {
      to: "/security",
      icon: <Shield size={20} />,
      label: "Security",
      category: "security",
    },
    {
      to: "/security-dashboard",
      icon: <Shield size={20} />,
      label: "Security Dashboard",
      category: "security",
    },
    {
      to: "/audit",
      icon: <History size={20} />,
      label: "Audit Log",
      category: "security",
    },
    {
      to: "/compliance",
      icon: <Shield size={20} />,
      label: "Compliance",
      category: "security",
    },

    // Team & Settings
    {
      to: "/team",
      icon: <Users size={20} />,
      label: "Team",
      category: "system",
    },
    {
      to: "/integrations",
      icon: <Link size={20} />,
      label: "Integrations",
      category: "system",
    },
    {
      to: "/settings",
      icon: <Settings size={20} />,
      label: "Settings",
      category: "system",
    },
    {
      to: "/dashboard-builder",
      icon: <LayoutGrid size={20} />,
      label: "Dashboard Builder",
      category: "analytics",
    },
    {
      to: "/integration-hub",
      icon: <Cloud size={20} />,
      label: "Integration Hub",
      category: "settings",
    },
    {
      to: "/report-builder",
      icon: <BarChart3 size={20} />,
      label: "Report Builder",
      category: "analytics",
    },
    {
      to: "/api-manager",
      icon: <Key size={20} />,
      label: "API Manager",
      category: "settings",
    },
    {
      to: "/resources",
      icon: <Server size={20} />,
      label: "Resources",
      category: "system",
    },
    {
      to: "/projects",
      icon: <Server size={20} />,
      label: "Projects",
      category: "system",
    },
    {
      to: "/services",
      icon: <Network size={20} />,
      label: "Services",
      category: "system",
    },
    {
      to: "/knowledge",
      icon: <BookOpen size={20} />,
      label: "Knowledge Base",
      category: "resources",
    },
    {
      to: "/performance",
      icon: <Activity size={20} />,
      label: "Performance",
      category: "analytics",
    },
    {
      to: "/notifications",
      icon: <Bell size={20} />,
      label: "Notifications",
      category: "system",
    },
    {
      to: "/assets",
      icon: <FolderOpen size={20} />,
      label: "Assets",
      category: "resources",
    },
    {
      to: "/report-generator",
      icon: <FileText size={20} />,
      label: "Report Generator",
      category: "analytics",
    },
    {
      to: "/search",
      icon: <Search size={20} />,
      label: "Search",
      category: "tools",
    },
  ];

  const categories = [
    { id: "main", label: "Core Features" },
    { id: "data", label: "Data Sources" },
    { id: "ai", label: "AI & Automation" },
    { id: "dev", label: "Development" },
    { id: "security", label: "Security & Compliance" },
    { id: "system", label: "Team & Settings" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
    { id: "automation", label: "Automation" },
    { id: "resources", label: "Resources" },
    { id: "tools", label: "Tools" },
  ];

  const renderNavItems = (category: string) =>
    navItems
      .filter((item) => item.category === category)
      .map((item) => (
        <NavItem
          key={item.to}
          {...item}
          isActive={location.pathname === item.to}
          collapsed={collapsed && !isMobile}
        />
      ));

  return (
    <div className="min-h-screen bg-background flex flex-col ">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 container items-center">
          <div className="mr-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <span className="font-bold text-xl">Logify</span>
            </Link>
          </div>

          {/* Project Selector */}
          <div className="flex items-center gap-4">
            {projects.length > 0 && (
              <>
                <Select
                  value={currentProject?.id}
                  onValueChange={(value) => {
                    const project = projects.find((p) => p.id === value);
                    if (project) setCurrentProject(project);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={currentEnvironment}
                  onValueChange={(value) => setCurrentEnvironment(value as Environment)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          {/* Command Menu Trigger */}
          <Button
            variant="outline"
            className="flex-1 justify-start text-muted-foreground max-w-sm ml-4 hidden md:flex"
            onClick={() => setCommandOpen(true)}
          >
            <SearchIcon className="mr-2 h-4 w-4" />
            Search...
            <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <div className="flex flex-1 items-center justify-end space-x-4">
            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Add User</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>New Alert</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Create Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[380px]">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  <Button variant="ghost" size="sm">
                    Mark all as read
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-start gap-4 p-4">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">High CPU Usage Alert</p>
                    <p className="text-sm text-muted-foreground">
                      Server CPU usage exceeded 90%
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">
                        2 min ago
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start gap-4 p-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">Backup Completed</p>
                    <p className="text-sm text-muted-foreground">
                      Daily backup completed successfully
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">
                        15 min ago
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="@user" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Team</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Github className="mr-2 h-4 w-4" />
                    <span>GitHub</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Command Menu */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem>
              <SearchIcon className="mr-2 h-4 w-4" />
              <span>Search Logs</span>
            </CommandItem>
            <CommandItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>View Alerts</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <div className="flex pt-16 h-[calc(100vh-0px)]">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r",
            "transition-all duration-300 ease-in-out z-40",
            collapsed ? "w-[60px]" : "w-64",
            isMobile && "transform",
            isMobile && !mobileOpen && "-translate-x-full",
            isMobile && mobileOpen && "translate-x-0 w-64"
          )}
        >
          <div className="flex flex-col h-full overflow-y-scroll">
            <nav className="flex-1 space-y-6 p-2">
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  {!collapsed && (
                    <div className="px-4 py-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        {category.label}
                      </h4>
                    </div>
                  )}
                  {renderNavItems(category.id)}
                </React.Fragment>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t">
              {!collapsed && (
                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="@user" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">John Doe</p>
                    <p className="text-xs text-muted-foreground truncate">
                      john@example.com
                    </p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() =>
                  isMobile ? setMobileOpen(false) : setCollapsed(!collapsed)
                }
              >
                <ChevronLeft
                  size={20}
                  className={cn(
                    "transition-transform",
                    collapsed && "rotate-180"
                  )}
                />
                {!collapsed && <span>Collapse</span>}
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isMobile && mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            collapsed && !isMobile ? "ml-[60px]" : "ml-64",
            isMobile && "ml-0"
          )}
        >
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
