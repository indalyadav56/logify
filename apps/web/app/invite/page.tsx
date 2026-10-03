"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { useInvitationToken } from "@/lib/invitation-link"
import { acceptInvitation, previewInvitation, type TeamInvitation } from "@/lib/api/teams/client"
import { roleLabel } from "@/lib/project"
import { LogifyLogo } from "@/components/marketing/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function InvitationPage() {
  const token = useInvitationToken("token")
  const { status, user } = useAuth()
  return <main className="flex min-h-dvh flex-col items-center justify-center gap-7 bg-white px-4 py-10">
    <Link href="/" aria-label="Logify home"><LogifyLogo /></Link>
    <Card className="w-full max-w-md gap-5 rounded-xl border bg-white shadow-none ring-0">
      <CardHeader><div className="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted/30"><Users className="size-5" /></div><CardTitle className="text-xl"><h1>Project invitation</h1></CardTitle><CardDescription>Join your team on Logify.</CardDescription></CardHeader>
      {status === "loading" || token === null ? <CardContent><Loading /></CardContent> : !token ? <CardContent className="space-y-4"><p role="alert" className="text-sm text-muted-foreground">This link is incomplete or invalid. Ask a project admin for a new invitation.</p><Button asChild variant="outline"><Link href="/dashboard/logs">Go to Logify</Link></Button></CardContent> : status === "unauthenticated" ? <>
        <CardContent><p className="text-sm text-muted-foreground">Sign in with the invited email address to view and accept this invitation.</p></CardContent>
        <CardFooter className="flex-col items-stretch gap-3"><Button asChild><Link href={`/login#invite=${encodeURIComponent(token)}`}>Sign in to continue</Link></Button><Button asChild variant="outline"><Link href={`/signup#invite=${encodeURIComponent(token)}`}>Create an account</Link></Button></CardFooter>
      </> : <InvitationDetails key={`${user?.id}:${token}`} token={token} />}
    </Card>
  </main>
}

function InvitationDetails({ token }: { token: string }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [invitation, setInvitation] = useState<TeamInvitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    previewInvitation(token).then(value => {
      if (active) { setInvitation(value); setLoading(false); setError(null) }
    }).catch(err => {
      if (active) { setError(message(err)); setLoading(false) }
    })
    return () => { active = false }
  }, [token, attempt])

  async function join() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const project = await acceptInvitation(token)
      try { window.localStorage.setItem("logify:current-project-id", project.id) } catch { /* Project is still available in the selector. */ }
      router.replace("/dashboard/logs")
    } catch (err) { setError(message(err)); setBusy(false) }
  }
  return <>
    <CardContent className="space-y-4">
      {loading ? <Loading /> : invitation && <div className="space-y-3"><p className="text-lg font-semibold">{invitation.project_name}</p><div className="flex items-center gap-2"><Badge variant="outline" className="rounded-md font-normal">{roleLabel(invitation.role)}</Badge><span className="text-xs text-muted-foreground">{invitation.status === "accepted" ? "Already accepted" : `Expires ${new Date(invitation.expires_at).toLocaleDateString()}`}</span></div><p className="text-sm text-muted-foreground">{invitation.status === "accepted" ? "You have already used this invitation. Open the project with your current access." : `You’re invited as a ${roleLabel(invitation.role)}. Joining gives you access to this project’s logs.`}</p></div>}
      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && !invitation && <Button variant="outline" onClick={() => { setLoading(true); setAttempt(value => value + 1) }}>Try again</Button>}
      <p className="break-all text-xs text-muted-foreground">Signed in as {user?.email}</p>
    </CardContent>
    <CardFooter className="flex-col items-stretch gap-3 border-t pt-4">
      {invitation && <Button disabled={busy || loading} onClick={() => void join()}>{busy && <Loader2 className="size-4 animate-spin" />}{busy ? "Opening project…" : invitation.status === "accepted" ? "Open project" : "Join project"}</Button>}
      <Button variant="outline" disabled={busy} onClick={logout}>Use another account</Button>
    </CardFooter>
  </>
}
function Loading() { return <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading invitation…</p> }
function message(err: unknown) { return err instanceof Error ? err.message : "Couldn’t open the invitation. Please try again." }
