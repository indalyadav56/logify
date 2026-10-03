"use client"

import { useState } from "react"
import { Copy, Folder, KeyRound, Loader2, LogOut, UserRound } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth-store"
import { useProjectStore } from "@/lib/project-store"
import { canManageProject, type ProjectSummary } from "@/lib/project"
import { ProjectApiKeys } from "@/components/project/project-api-keys"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const cardClass = "gap-5 rounded-xl border bg-white shadow-none ring-0"
const tabClass = "rounded-none px-3 data-[state=active]:text-foreground data-[state=active]:after:opacity-100 sm:px-4"

export default function SettingsPage() {
  const { project } = useProjectStore()

  return (
    <div className="mx-auto w-full max-w-5xl shrink-0 px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
      <div className="mb-6">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Workspace / {project?.name ?? "Your projects"}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your project, API keys, and account.</p>
      </div>

      <Tabs defaultValue="project" className="gap-6">
        <div className="border-b">
          <TabsList variant="line" className="h-11 px-0" aria-label="Settings sections">
            <TabsTrigger value="project" className={tabClass}><Folder className="size-4" />Project</TabsTrigger>
            <TabsTrigger value="api-keys" className={tabClass}><KeyRound className="size-4" />API keys</TabsTrigger>
            <TabsTrigger value="account" className={tabClass}><UserRound className="size-4" />Account</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="project">
          {project ? <ProjectSettings key={project.id} project={project} /> : <ProjectPlaceholder />}
        </TabsContent>

        <TabsContent value="api-keys">
          {project ? (
            <Card className={cardClass}>
              <CardHeader>
                <CardTitle><h2>API keys</h2></CardTitle>
                <CardDescription>Connect applications to {project.name}. Each key can send logs to this project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {canManageProject(project.role) ? <ProjectApiKeys key={project.id} projectId={project.id} showCommand={false} /> : <p className="text-sm text-muted-foreground">Only the project owner and admins can manage API keys. Ask an admin to connect your application.</p>}
              </CardContent>
            </Card>
          ) : <ProjectPlaceholder />}
        </TabsContent>

        <TabsContent value="account"><AccountSettings /></TabsContent>
      </Tabs>
    </div>
  )
}

function ProjectSettings({ project }: { project: ProjectSummary }) {
  const manager = canManageProject(project.role)
  const { updateProject } = useProjectStore()
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const trimmedName = name.trim()
  const trimmedDescription = description.trim()
  const changed = trimmedName !== project.name || trimmedDescription !== (project.description ?? "")

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || !manager || !changed) return
    if (Array.from(trimmedName).length < 2) {
      setError("Enter a project name with at least 2 characters.")
      return
    }
    setError(null)
    setSaving(true)
    try {
      const updated = await updateProject(project.id, { name: trimmedName, description: trimmedDescription })
      setName(updated.name)
      setDescription(updated.description ?? "")
      toast.success("Project settings saved.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t save your project. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle><h2>Project details</h2></CardTitle>
        <CardDescription>{manager ? "Update the name and description of your selected project." : "Project details. Only the owner and admins can make changes."}</CardDescription>
      </CardHeader>
      <form onSubmit={save}>
        <CardContent className="space-y-5 pb-5">
          <div className="space-y-2">
            <Label htmlFor="settings-project-name">Project name</Label>
            <Input id="settings-project-name" value={name} onChange={event => setName(event.target.value)} maxLength={255} required disabled={saving || !manager} className="max-w-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-project-description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Textarea id="settings-project-description" value={description} onChange={event => setDescription(event.target.value)} maxLength={1000} rows={3} placeholder="What is this project for?" disabled={saving || !manager} className="min-h-20 resize-y rounded-md border border-input bg-white shadow-none" />
          </div>
          <ReadOnlyField id="settings-project-id" label="Project ID" value={project.id} copy />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">Changes apply to this project.</p>
          {manager && <Button type="submit" disabled={saving || !changed || Array.from(trimmedName).length < 2}>
            {saving && <Loader2 className="size-4 animate-spin" />}{saving ? "Saving…" : "Save changes"}
          </Button>}
        </CardFooter>
      </form>
    </Card>
  )
}

function AccountSettings() {
  const { user, logout } = useAuth()
  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle><h2>Your account</h2></CardTitle>
        <CardDescription>Details for the account you’re signed in with.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReadOnlyField id="settings-account-email" label="Email address" value={user?.email ?? ""} />
        <ReadOnlyField id="settings-account-id" label="Account ID" value={user?.id ?? ""} copy />
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-3 border-t pt-4">
        <div><p className="text-sm font-medium">Current session</p><p className="mt-1 text-xs text-muted-foreground">Sign out of Logify on this browser.</p></div>
        <Button variant="outline" onClick={logout}><LogOut className="size-4" />Sign out</Button>
      </CardFooter>
    </Card>
  )
}

function ReadOnlyField({ id, label, value, copy = false }: { id: string; label: string; value: string; copy?: boolean }) {
  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied.`)
    } catch {
      toast.error("Couldn’t copy. Select and copy the value manually.")
    }
  }
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex max-w-lg gap-2">
        <Input id={id} value={value} readOnly className={copy ? "min-w-0 bg-muted/30 font-mono text-xs" : "bg-muted/30"} />
        {copy && <Button type="button" variant="outline" size="icon" onClick={() => void copyValue()} disabled={!value} aria-label={`Copy ${label.toLowerCase()}`}><Copy className="size-4" /></Button>}
      </div>
    </div>
  )
}

function ProjectPlaceholder() {
  const { status, error, refresh, setCreateOpen } = useProjectStore()
  return (
    <Card className={`${cardClass} items-center p-8 text-center`}>
      {status === "loading" ? <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading project settings…</p> : (
        <>
          <Folder className="size-6 text-muted-foreground" />
          <div><h2 className="text-base font-semibold">{error ? "Couldn’t load your projects" : "Select a project to get started"}</h2><p className="mt-2 text-sm text-muted-foreground" role={error ? "alert" : undefined}>{error ?? "Create a project to manage its settings and API keys."}</p></div>
          <Button variant="outline" onClick={error ? () => void refresh() : () => setCreateOpen(true)}>{error ? "Try again" : "Create project"}</Button>
        </>
      )}
    </Card>
  )
}
