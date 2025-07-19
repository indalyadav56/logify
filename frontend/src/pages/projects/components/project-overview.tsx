import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BarChart,
  Box,
  Edit,
  Settings,
  Trash,
  Users,
} from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";

interface ProjectOverviewProps {
  project: {
    id: string;
    name: string;
    environment: string;
    description?: string;
    stats?: {
      totalLogs?: number;
      storageUsed?: number;
      errorRate?: number;
    };
  };
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const { deleteProject } = useProjectStore();

  return (
    <div className="grid gap-6">
      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <p className="font-medium">{project.name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Environment
                </label>
                <div>
                  <Badge
                  // variant={
                  //   project.environment === "prod"
                  //     ? "destructive"
                  //     : project.environment === "staging"
                  //     ? "warning"
                  //     : "secondary"
                  // }
                  >
                    {project.environment}
                  </Badge>
                </div>
              </div>
              {project.description && (
                <div>
                  <label className="text-sm text-muted-foreground">
                    Description
                  </label>
                  <p>{project.description}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this project?"
                      )
                    ) {
                      deleteProject(project.id);
                    }
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  <span className="capitalize">{project.environment}</span>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Configure Environment
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Members</p>
                  <p className="text-sm text-muted-foreground">
                    {project.stats?.totalLogs || 0} members
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Volume</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {project.stats?.totalLogs?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Logs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Used</CardTitle>
            <CardDescription>Total storage consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <BarChart className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {((project.stats?.storageUsed || 0) / 1000000000).toFixed(
                      2
                    )}{" "}
                    GB
                  </p>
                  <p className="text-sm text-muted-foreground">Used of 5 GB</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
            <CardDescription>Current error percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-destructive" />
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {project.stats?.errorRate || 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Last hour</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
