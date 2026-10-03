"use client"

import { useEffect, useId, useState } from "react"
import { Check, Copy, KeyRound, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { createApiKey, listApiKeys, revokeApiKey, type CreatedApiKey, type ProjectApiKey } from "@/lib/api/api-keys/client"
import { getApiBaseUrl } from "@/lib/api/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export function ProjectApiKeys({ projectId, showCommand = true, compact = false }: { projectId: string; showCommand?: boolean; compact?: boolean }) {
  const nameId = useId()
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [keys, setKeys] = useState<ProjectApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("my-app")
  const [issued, setIssued] = useState<CreatedApiKey | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<ProjectApiKey | null>(null)

  useEffect(() => {
    let active = true
    listApiKeys(projectId).then(items => {
      if (active) { setKeys(items); setLoading(false) }
    }).catch(err => {
      if (active) { setError(errorMessage(err)); setLoading(false) }
    })
    return () => { active = false }
  }, [projectId, loadAttempt])

  const payload = JSON.stringify({ level: "info", service: "my-app", message: "Hello from my application" })
  const command = [
    `curl -X POST '${getApiBaseUrl()}/v1/logs'`,
    "  -H 'Content-Type: application/json'",
    "  -H 'X-API-Key: YOUR_API_KEY'",
    `  -d '${payload}'`,
  ].join(" \\\n")

  async function copy(value: string, kind: string) {
    try { await navigator.clipboard.writeText(value); setCopied(kind) }
    catch { toast.error("Couldn’t copy. Please copy the value manually.") }
  }

  async function create(event: React.FormEvent) {
    event.preventDefault()
    if (busy || !name.trim()) return
    setBusy(true)
    try {
      const key = await createApiKey(projectId, name.trim())
      setIssued(key)
      setKeys(items => [{ id: key.id, project_id: key.project_id, name: key.name, key_prefix: key.key_prefix, created_at: key.created_at, revoked_at: key.revoked_at }, ...items])
      setCopied(null)
    } catch (err) { toast.error(errorMessage(err)) }
    finally { setBusy(false) }
  }

  async function revoke(key: ProjectApiKey) {
    setBusy(true)
    try {
      await revokeApiKey(projectId, key.id)
      setKeys(items => items.map(item => item.id === key.id ? { ...item, revoked_at: new Date().toISOString() } : item))
      if (issued?.id === key.id) { setIssued(null); setCopied(null) }
      toast.success("API key revoked.")
    } catch (err) { toast.error(errorMessage(err)) }
    finally { setBusy(false) }
  }

  return (
    <>
      {issued ? (
        <section className="space-y-3 rounded-lg border p-4" aria-label="New API key">
          <div className="flex items-center gap-2 text-sm font-medium"><KeyRound className="size-4" />Save your API key</div>
          <p className="text-xs leading-5 text-muted-foreground">This key is shown only once. Save it before leaving this section.</p>
          <div className="flex gap-2">
            <Input type="password" readOnly value={issued.key} aria-label="Generated API key" className="font-mono" />
            <Button variant="outline" onClick={() => void copy(issued.key, "key")}>
              {copied === "key" ? <Check className="size-4" /> : <Copy className="size-4" />}{copied === "key" ? "Copied" : "Copy key"}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setIssued(null); setCopied(null) }}>I’ve saved my key</Button>
        </section>
      ) : (
        <form onSubmit={create} className="space-y-2">
          <Label htmlFor={nameId}>Key name</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id={nameId} value={name} onChange={event => setName(event.target.value)} maxLength={64} required placeholder="e.g. production-api" disabled={busy} />
            <Button type="submit" disabled={busy || loading || !!error || !name.trim()}>{busy && <Loader2 className="size-4 animate-spin" />}Create key</Button>
          </div>
        </form>
      )}

      {showCommand && <section className="space-y-2" aria-label="Ingest command">
        <p className="text-sm font-medium">Send a test log</p>
        <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-5">{command}</pre>
        <Button variant="outline" onClick={() => void copy(command.replace("YOUR_API_KEY", issued?.key ?? "YOUR_API_KEY"), "command")} className="w-full">
          {copied === "command" ? <Check className="size-4" /> : <Copy className="size-4" />}{copied === "command" ? "Copied" : issued ? "Copy command" : "Copy template"}
        </Button>
        <p className="text-xs leading-4 text-muted-foreground">{issued ? "The copied command includes your new API key. " : "Replace YOUR_API_KEY with a key you saved. "}The key selects this project automatically. Refresh your logs after sending the event.</p>
      </section>}

      <section className="space-y-2 border-t pt-4" aria-label="Project API keys">
        <p className="text-sm font-medium">{compact ? "API keys" : "Project keys"}</p>
        {loading ? <p className="text-sm text-muted-foreground">Loading keys…</p> : error ? <div className="space-y-2"><p role="alert" className="text-sm text-destructive">{error}</p><Button size="sm" variant="outline" onClick={() => { setLoading(true); setError(null); setLoadAttempt(value => value + 1) }}>Try again</Button></div> : keys.length === 0 ? <p className="text-sm text-muted-foreground">No keys yet. Create one to connect your application.</p> : (
          <ul className={compact ? "max-h-40 space-y-2 overflow-y-auto" : "space-y-2"}>
            {keys.map(key => (
              <li key={key.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{key.name}</p><p className="font-mono text-xs text-muted-foreground">{key.key_prefix}…</p>{!compact && <p className="mt-1 text-xs text-muted-foreground">Created {new Date(key.created_at).toLocaleDateString()}</p>}</div>
                {key.revoked_at ? <Badge variant="secondary">Revoked</Badge> : <div className="flex shrink-0 items-center gap-2">{!compact && <Badge variant="outline">Active</Badge>}<Button size="sm" variant="ghost" disabled={busy} onClick={() => setRevokeTarget(key)} aria-label={`Revoke ${key.name}`}>Revoke</Button></div>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <AlertDialog open={!!revokeTarget} onOpenChange={value => { if (!value) setRevokeTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Revoke {revokeTarget?.name}?</AlertDialogTitle><AlertDialogDescription>Applications using this key will no longer be able to send logs. You can create a replacement key.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { if (revokeTarget) void revoke(revokeTarget) }}>Revoke key</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Couldn’t manage API keys. Please try again."
}
