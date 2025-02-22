import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Box,
  FileText,
  Home,
  LayoutDashboard,
  Settings,
  AlertTriangle,
  Bell,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SideNavProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Projects", icon: Box, href: "/projects" },
  { title: "Logs", icon: FileText, href: "/logs", badge: 12 },
  { title: "Alerts", icon: AlertTriangle, href: "/alerts", badge: 3 },
  { title: "Analytics", icon: BarChart, href: "/analytics" },
];

const bottomNavItems: NavItem[] = [
  { title: "Team", icon: Users, href: "/team" },
  { title: "Notifications", icon: Bell, href: "/notifications" },
  { title: "Settings", icon: Settings, href: "/settings" },
];

export function SideNav({ isOpen, setIsOpen }: SideNavProps) {
  const NavItem = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    
    const content = (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-150 ease-in-out",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          )
        }
      >
        <Icon className="h-5 w-5" />
        {isOpen && (
          <>
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );

    return isOpen ? (
      content
    ) : (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.title}
          {item.badge && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 z-20 flex h-full flex-col border-r bg-white transition-all duration-300 ease-in-out dark:bg-gray-800",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Home className="h-6 w-6 text-primary" />
        {isOpen && <span className="font-semibold">Logify</span>}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-2 px-3">
          {mainNavItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="border-t px-3 py-4">
        <nav className="flex flex-col gap-2">
          {bottomNavItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
