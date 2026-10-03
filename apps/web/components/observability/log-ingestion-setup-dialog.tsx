"use client"

import { Terminal } from "lucide-react"
import { canManageProject } from "@/lib/project"
import { useProjectStore } from "@/lib/project-store"
import { ProjectApiKeys } from "@/components/project/project-api-keys"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type LogIngestionSetupDialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

export function LogIngestionSetupDialog({ open, onOpenChange }: LogIngestionSetupDialogProps) {
  const { project } = useProjectStore()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-4 overflow-y-auto rounded-xl sm:max-w-xl">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted/50"><Terminal className="size-5" /></div>
          <DialogTitle>Connect a source</DialogTitle>
          <DialogDescription>Send logs to {project?.name ?? "your project"} with a project API key.</DialogDescription>
        </DialogHeader>
        {project ? canManageProject(project.role) ? <ProjectApiKeys key={project.id} projectId={project.id} compact /> : <p className="text-sm text-muted-foreground">Only the project owner and admins can manage API keys. Ask an admin to connect your application.</p> : <p className="text-sm text-muted-foreground">Select a project to connect your application.</p>}
      </DialogContent>
    </Dialog>
  )
}
