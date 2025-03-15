import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { ProjectSelector } from "../ProjectSelector";

interface TopNavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function TopNavbar({ isSidebarOpen, toggleSidebar }: TopNavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="border-b bg-white dark:bg-gray-800">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:block">
            <ProjectSelector />
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 px-4 lg:px-8">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search logs, errors, traces..."
              className="w-full bg-gray-50 pl-9 dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
            <img
              src="/placeholder-avatar.jpg"
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
