import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  AlertCircle,
  Search,
  Activity,
  GitGraph,
  Settings,
  Database,
  Cpu,
  Network,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigation = [
  { name: "Overview", href: "/", icon: BarChart3, description: "System overview and key metrics" },
  { name: "Logs", href: "/logs", icon: Search, description: "Log aggregation and analysis" },
  { name: "Metrics", href: "/metrics", icon: Activity, description: "System metrics and performance" },
  { name: "Traces", href: "/traces", icon: GitGraph, description: "Distributed tracing" },
  { name: "Alerts", href: "/alerts", icon: AlertCircle, description: "Alert management" },
  { name: "Infrastructure", href: "/infrastructure", icon: Network, description: "Infrastructure monitoring" },
  { name: "Databases", href: "/databases", icon: Database, description: "Database monitoring" },
  { name: "Services", href: "/services", icon: Cpu, description: "Service health and dependencies" },
  { name: "Teams", href: "/teams", icon: Users, description: "Team management" },
  { name: "Settings", href: "/settings", icon: Settings, description: "Platform configuration" },
];

export function NavMenu() {
  const location = useLocation();

  return (
    <nav className="space-y-2 px-2">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Tooltip key={item.name} delayDuration={0}>
            <TooltipTrigger asChild>
              <Link to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-x-3",
                    isActive && "bg-primary/10"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-sm">
              {item.description}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
