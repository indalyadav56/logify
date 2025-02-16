import { useProjectStore } from "@/store/useProjectStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Archive,
  BarChart,
  Key,
  MoreHorizontal,
  Settings,
  Trash,
} from "lucide-react";
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

interface ProjectListProps {
  showArchived?: boolean;
}

export function ProjectList({ showArchived = false }: ProjectListProps) {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Logs</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{project.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {project.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {project.environment}
                </Badge>
              </TableCell>
              <TableCell>{project.logs_count || 0}</TableCell>
              <TableCell>{project.team_members?.length || 0}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(project.created_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
