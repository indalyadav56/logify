import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  BarChart2,
  LayoutDashboard,
  Terminal,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const sidebarItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    title: "Logs",
    href: "/logs",
    icon: <Terminal className="h-5 w-5" />,
    badge: 3,
  }
];


interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;

    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
          "hover:bg-accent hover:text-accent-foreground",
          isActive && "bg-accent text-accent-foreground",
          !isCollapsed && "w-full"
        )}
      >
        <div className="relative">
          {item.icon}
          {item.badge && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {item.badge}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <span className="font-medium">{item.title}</span>
        )}
      </Link>
    );
  };

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 z-40 flex h-screen flex-col",
        "border-r bg-background",
        className
      )}
    >
      {/* Top Section */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-xl font-bold text-primary"
          >
            Logify
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {sidebarItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
