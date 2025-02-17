import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectStore } from "@/store/useProjectStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "../components/project-overview";
import { ProjectMembers } from "../components/project-members";
import { ProjectSettings } from "../components/project-settings";
import { ProjectApiKeys } from "../components/project-api-keys";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjectStore();
  const [activeTab, setActiveTab] = useState("overview");



  const project = projects.find((p) => p.id === id);

  // if (isLoading) {
  //   return (
  //     <div className="container py-8 space-y-8">
  //       <div className="space-y-2">
  //         <Skeleton className="h-8 w-[200px]" />
  //         <Skeleton className="h-4 w-[300px]" />
  //       </div>
  //       <Skeleton className="h-[500px] w-full" />
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="container py-8">
  //       <Alert variant="destructive">
  //         <AlertCircle className="h-4 w-4" />
  //         <AlertDescription>{error}</AlertDescription>
  //       </Alert>
  //     </div>
  //   );
  // }

  // if (!project) {
  //   return (
  //     <div className="container py-8">
  //       <Alert variant="destructive">
  //         <AlertCircle className="h-4 w-4" />
  //         <AlertDescription>Project not found</AlertDescription>
  //       </Alert>
  //     </div>
  //   );
  // }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project?.name}</h1>
        <p className="text-muted-foreground">
          Manage your project settings and team members
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <ProjectOverview project={projects[0]} />
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
          <ProjectMembers project={projects[0]} />
        </TabsContent>
        <TabsContent value="api-keys" className="space-y-4">
          <ProjectApiKeys project={projects[0]} />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <ProjectSettings project={projects[0]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
