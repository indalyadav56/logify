"use client"

import { useEffect, useState } from "react"
import { Copy, Loader2, MailPlus, ShieldCheck, Users } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-store"
import { useProjectStore } from "@/lib/project-store"
import { canManageProject, initialsFromName, roleLabel } from "@/lib/project"
import { cancelInvitation, changeMemberRole, createInvitation, getTeam, removeMember, type MemberRole, type ProjectTeam as Team, type TeamInvitation, type TeamMember } from "@/lib/api/teams/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type Action =
  | { kind: "role"; member: TeamMember; role: MemberRole }
  | { kind: "remove"; member: TeamMember }
  | { kind: "cancel"; invitation: TeamInvitation }

const roleDetails: Record<MemberRole, string> = {
  admin: "Manage project settings, API keys, and members.",
  member: "View, search, and send logs.",
  viewer: "View and search logs. No changes or log ingestion.",
}
const cardClass = "gap-5 rounded-xl border bg-white shadow-none ring-0"

export function ProjectTeam({ projectId }: { projectId: string }) {
  const { user } = useAuth()
  const { refresh } = useProjectStore()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<MemberRole>("member")
  const [issued, setIssued] = useState<{ id: string; email: string; link: string } | null>(null)
  const [action, setAction] = useState<Action | null>(null)

  useEffect(() => {
    let active = true
    getTeam(projectId).then(value => {
      if (active) { setTeam(value); setError(null); setLoading(false) }
    }).catch(err => {
      if (active) { setTeam(null); setError(message(err)); setLoading(false) }
    })
    return () => { active = false }
  }, [projectId, loadAttempt])

  function reload() { setLoading(true); setLoadAttempt(attempt => attempt + 1) }
  const manager = team ? canManageProject(team.role) : false
  const invitations = team?.invitations.filter(item => item.status === "pending" || item.status === "expired") ?? []
  const self = team?.members.find(member => member.user_id === user?.id)

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || loading || !manager) return
    setBusy(true)
    setInviteError(null)
    try {
      const created = await createInvitation(projectId, email.trim(), inviteRole)
      const { token, ...metadata } = created
      setIssued({ id: created.id, email: created.email, link: `${window.location.origin}/invite#token=${encodeURIComponent(token)}` })
      setTeam(current => current ? { ...current, invitations: [metadata, ...current.invitations] } : current)
      setEmail("")
      toast.success("Invitation created. Copy the link to share it.")
    } catch (err) { setInviteError(message(err)) }
    finally { setBusy(false) }
  }

  async function copyLink() {
    if (!issued) return
    try { await navigator.clipboard.writeText(issued.link); toast.success("Invitation link copied.") }
    catch { toast.error("Couldn’t copy. Select and copy the link manually.") }
  }

  async function confirmAction() {
    if (!action || busy) return
    setBusy(true)
    setError(null)
    try {
      if (action.kind === "role") await changeMemberRole(projectId, action.member.user_id, action.role)
      if (action.kind === "remove") await removeMember(projectId, action.member.user_id)
      if (action.kind === "cancel") {
        await cancelInvitation(projectId, action.invitation.id)
        if (issued?.id === action.invitation.id) setIssued(null)
      }
      toast.success(action.kind === "role" ? "Member role updated." : action.kind === "cancel" ? "Invitation canceled." : action.member.user_id === user?.id ? "You left the project." : "Member removed.")
      setAction(null)
      reload()
      if (action.kind !== "cancel") await refresh()
    } catch (err) { toast.error(message(err)); setAction(null); reload() }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1.5"><CardTitle><h2>Project members</h2></CardTitle><CardDescription>Share this project’s logs with your team.</CardDescription></div>
          {team && <Badge variant="outline" className="shrink-0 rounded-md font-normal">{team.members.length} {team.members.length === 1 ? "member" : "members"}</Badge>}
        </CardHeader>
        <CardContent className="space-y-5">
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {loading && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading team…</p>}
          {!loading && !team && <Button variant="outline" onClick={reload}>Try again</Button>}
          {team && (
            <>
              <div className="divide-y rounded-lg border">
                {team.members.map(member => (
                  <div key={member.user_id} className="flex flex-wrap items-center gap-3 p-4">
                    <Avatar className="size-9 shrink-0"><AvatarFallback className="bg-muted text-xs">{initialsFromName(member.full_name || member.email)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="truncate text-sm font-medium">{member.full_name || member.email}{member.user_id === user?.id && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {manager && member.role !== "owner" ? (
                        <RoleSelect value={member.role} onChange={role => { if (role !== member.role) setAction({ kind: "role", member, role }) }} disabled={busy || loading} label={`Role for ${member.full_name || member.email}`} />
                      ) : <Badge variant="outline" className="rounded-md px-2.5 py-1 font-normal">{member.role === "owner" && <ShieldCheck className="size-3" />}{roleLabel(member.role)}</Badge>}
                      {manager && member.role !== "owner" && member.user_id !== user?.id && <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setAction({ kind: "remove", member })} disabled={busy || loading}>Remove<span className="sr-only"> {member.full_name || member.email}</span></Button>}
                    </div>
                  </div>
                ))}
              </div>
              {!manager && <p className="text-xs text-muted-foreground">Only the project owner and admins can invite people or change roles.</p>}
              {self && self.role !== "owner" && <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="text-xs text-muted-foreground">Leaving removes your access to this project.</p><Button variant="outline" size="sm" onClick={() => setAction({ kind: "remove", member: self })} disabled={busy || loading}>Leave project</Button></div>}
            </>
          )}
        </CardContent>
      </Card>

      {manager && (
        <Card className={cardClass}>
          <CardHeader><CardTitle><h2 className="flex items-center gap-2"><MailPlus className="size-4" />Invite a teammate</h2></CardTitle><CardDescription>Create a link for their email address. They can sign in or create an account to join.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={invite} className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 space-y-2"><Label htmlFor="team-invite-email">Email address</Label><Input id="team-invite-email" type="email" autoComplete="email" placeholder="teammate@company.com" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} disabled={busy || loading} /></div>
                <div className="space-y-2"><Label htmlFor="team-invite-role">Role</Label><RoleSelect id="team-invite-role" value={inviteRole} onChange={setInviteRole} disabled={busy || loading} label="Invitation role" /></div>
                <Button type="submit" disabled={busy || loading || !email.trim()}>{busy && <Loader2 className="size-4 animate-spin" />}Create invitation</Button>
              </div>
              <p className="text-xs text-muted-foreground">{roleDetails[inviteRole]} Links expire after 7 days.</p>
            </form>
            {inviteError && <p role="alert" className="text-sm text-destructive">{inviteError}</p>}
            {issued && <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div className="space-y-1"><p className="text-sm font-medium">Share this link with {issued.email}</p><p className="text-xs text-muted-foreground">Copy it now. The complete link is only shown once. Share it directly; no email has been sent.</p></div>
              <div className="flex min-w-0 gap-2"><Input value={issued.link} readOnly aria-label="Invitation link" className="min-w-0 bg-white font-mono text-xs" /><Button type="button" variant="outline" size="icon" aria-label="Copy invitation link" onClick={() => void copyLink()}><Copy className="size-4" /></Button></div>
              <Button variant="outline" size="sm" onClick={() => setIssued(null)}>Done</Button>
            </div>}
            <div className="border-t pt-4">
              <h3 className="mb-3 text-sm font-medium">Invitations <span className="ml-1 text-muted-foreground">{invitations.length}</span></h3>
              {invitations.length ? <div className="divide-y rounded-lg border">{invitations.map(invitation => (
                <div key={invitation.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1 basis-40"><p className="truncate text-sm">{invitation.email}</p><p className="mt-1 text-xs text-muted-foreground">{roleLabel(invitation.role)} · {invitation.status === "expired" ? "Expired" : `Expires ${new Date(invitation.expires_at).toLocaleDateString()}`}</p></div>
                  <Badge variant="secondary" className="rounded-md font-normal">{invitation.status === "expired" ? "Expired" : "Pending"}</Badge>
                  <Button variant="ghost" size="sm" disabled={busy || loading} onClick={() => setAction({ kind: "cancel", invitation })}>Cancel<span className="sr-only"> invitation for {invitation.email}</span></Button>
                </div>
              ))}</div> : <p className="text-sm text-muted-foreground">No pending invitations.</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 text-xs text-muted-foreground sm:grid-cols-3">
        {Object.entries(roleDetails).map(([role, detail]) => <div key={role}><p className="mb-1 font-medium capitalize text-foreground">{role}</p><p>{detail}</p></div>)}
      </div>
      <AlertDialog open={!!action} onOpenChange={open => { if (!open && !busy) setAction(null) }}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader><AlertDialogTitle>{action?.kind === "role" ? "Change member role?" : action?.kind === "cancel" ? "Cancel invitation?" : action?.member.user_id === user?.id ? "Leave this project?" : "Remove team member?"}</AlertDialogTitle><AlertDialogDescription>
            {action?.kind === "role" ? `${action.member.full_name || action.member.email} will become a ${roleLabel(action.role)}. ${!canManageProject(action.role) ? "Their API keys and pending invitations will be revoked." : roleDetails[action.role]}` : action?.kind === "cancel" ? `The invitation for ${action.invitation.email} will no longer work.` : action ? `${action.member.full_name || action.member.email} will lose access to this project. Their API keys and pending invitations will be revoked.` : ""}
          </AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={busy}>{action?.kind === "cancel" ? "Keep invitation" : "Cancel"}</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={event => { event.preventDefault(); void confirmAction() }}>{busy && <Loader2 className="size-4 animate-spin" />}{busy ? "Updating…" : "Confirm"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function RoleSelect({ value, onChange, disabled, label, id }: { value: MemberRole; onChange: (role: MemberRole) => void; disabled: boolean; label: string; id?: string }) {
  return <Select value={value} onValueChange={role => onChange(role as MemberRole)} disabled={disabled}><SelectTrigger id={id} aria-label={label} className="w-28 rounded-md border border-input bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="member">Member</SelectItem><SelectItem value="viewer">Viewer</SelectItem></SelectContent></Select>
}
function message(err: unknown) { return err instanceof Error ? err.message : "Couldn’t update the team. Please try again." }

export function TeamPlaceholder() {
  const { status, error, refresh, setCreateOpen } = useProjectStore()
  return <Card className={`${cardClass} items-center p-8 text-center`}>
    {status === "loading" ? <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading projects…</p> : <><Users className="size-6 text-muted-foreground" /><div><h2 className="text-base font-semibold">{error ? "Couldn’t load your projects" : "Select a project to manage its team"}</h2><p className="mt-2 text-sm text-muted-foreground" role={error ? "alert" : undefined}>{error ?? "Create a project, or join one with an invitation link."}</p></div><Button variant="outline" onClick={error ? () => void refresh() : () => setCreateOpen(true)}>{error ? "Try again" : "Create project"}</Button></>}
  </Card>
}
