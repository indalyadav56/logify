"use client"

import { useProjectStore } from "@/lib/project-store"
import { ProjectTeam, TeamPlaceholder } from "@/components/project/project-team"

export default function TeamsPage() {
  const { project } = useProjectStore()
  return <div className="mx-auto w-full max-w-5xl shrink-0 px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
    <div className="mb-6"><p className="mb-2 text-xs font-medium text-muted-foreground">Workspace / {project?.name ?? "Your projects"}</p><h1 className="text-3xl font-semibold tracking-tight">Teams</h1><p className="mt-2 text-sm text-muted-foreground">The people who have access to this project.</p></div>
    {project ? <ProjectTeam key={`${project.id}:${project.role}`} projectId={project.id} /> : <TeamPlaceholder />}
  </div>
}
