import { useEffect } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { useProjectStore } from "@/store/useProjectStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Settings,
  Activity,
  AlertTriangle,
  BarChart,
  Clock,
} from "lucide-react";

const projectTabs = [
  { name: "Overview", href: "overview", icon: Activity },
  { name: "Logs", href: "logs", icon: FileText },
  { name: "Errors", href: "errors", icon: AlertTriangle },
  { name: "Performance", href: "performance", icon: Clock },
  { name: "Analytics", href: "analytics", icon: BarChart },
  { name: "Settings", href: "settings", icon: Settings },
];

export function ProjectLayout() {
  const { projectId } = useParams();
  const { fetchProject, currentProject } = useProjectStore();

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  if (!currentProject) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {currentProject.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {currentProject.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Share
            </Button>
            <Button size="sm">
              Configure Alerts
            </Button>
          </div>
        </div>

        {/* Project Navigation */}
        <nav className="mt-6">
          <div className="flex space-x-1">
            {projectTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.href}
                  to={tab.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Project Content */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
