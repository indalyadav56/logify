import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectList } from "./components/project-list";
import { ProjectGrid } from "./components/project-grid";
import { CreateProject } from "./components/create-project";
import { Button } from "@/components/ui/button";
import { Grid, List, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function ProjectsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-2 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage your projects and their settings.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="space-y-0 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Projects</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-60">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      {view === "grid" ? (
                        <Grid className="h-4 w-4" />
                      ) : (
                        <List className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setView("grid")}>
                      <Grid className="mr-2 h-4 w-4" /> Grid View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setView("list")}>
                      <List className="mr-2 h-4 w-4" /> List View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {view === "grid" ? (
              <ProjectGrid showArchived={searchQuery !== ""} />
            ) : (
              <ProjectList />
            )}
          </CardContent>
        </Card>
      </div>

      <CreateProject open={isCreating} onOpenChange={setIsCreating} />
    </div>
  );
}
