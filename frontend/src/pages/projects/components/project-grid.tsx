import { useProjectStore } from "@/store/useProjectStore";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, BarChart, Key, MoreHorizontal, Settings, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface ProjectGridProps {
  showArchived?: boolean;
}

export function ProjectGrid({ showArchived = false }: ProjectGridProps) {
  const { projects, deleteProject, archiveProject } = useProjectStore();
  const navigate = useNavigate();

  const filteredProjects = projects.filter(
    (project) => (project.status === "archived") === showArchived
  );

  const handleArchive = async (id: string) => {
    try {
      await archiveProject(id);
    } catch (error) {
      console.error("Failed to archive project:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <ScrollArea className="h-[600px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="group">
            <CardHeader className="space-y-0 pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold leading-none">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {project.environment}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/settings`)}>
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/api-keys`)}>
                      <Key className="mr-2 h-4 w-4" /> API Keys
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/analytics`)}>
                      <BarChart className="mr-2 h-4 w-4" /> Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {!showArchived && (
                      <DropdownMenuItem
                        onClick={() => handleArchive(project.id)}
                      >
                        <Archive className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description || "No description provided"}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {project.logs_count || 0} Logs
                  </Badge>
                  <Badge variant="outline">
                    {project.team_members?.length || 0} Members
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              <div className="flex items-center">
                Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
