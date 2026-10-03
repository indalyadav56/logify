"use client"

import { useState } from "react"
import { Check, Copy, Terminal } from "lucide-react"
import { toast } from "sonner"
import { useProjectStore } from "@/lib/project-store"
import { useAuth } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type LogIngestionSetupDialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

export function LogIngestionSetupDialog({ open, onOpenChange }: LogIngestionSetupDialogProps) {
  const { project } = useProjectStore()
  const { accessToken } = useAuth()
  const [copied, setCopied] = useState(false)
  const endpoint = `${(process.env.NEXT_PUBLIC_LOGIFY_API_BASE_URL ?? "http://127.0.0.1:8080").replace(/\/$/, "")}/v1/logs`
  const payload = JSON.stringify({ project_id: project?.id ?? "YOUR_PROJECT_ID", level: "info", service: "my-app", message: "Hello from my application" })
  const command = [ `curl -X POST '${endpoint}'`, "  -H 'Content-Type: application/json'", "  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'", `  -d '${payload}'` ].join(" \
")
  async function copy() {
    try { await navigator.clipboard.writeText(command.replace("YOUR_ACCESS_TOKEN", accessToken ?? "YOUR_ACCESS_TOKEN")); setCopied(true) }
    catch { toast.error("Couldn’t copy the command.") }
  }
  return <Dialog open={open} onOpenChange={v => { onOpenChange(v); setCopied(false) }}>
    <DialogContent className="rounded-xl sm:max-w-xl">
      <DialogHeader><div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-muted/50"><Terminal className="size-5" /></div><DialogTitle>Send your first log</DialogTitle><DialogDescription>Run this command to send a test event to {project?.name ?? "your project"}.</DialogDescription></DialogHeader>
      <pre className="my-2 overflow-x-auto whitespace-pre-wrap break-all rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-6">{command}</pre>
      <Button onClick={() => void copy()} className="w-full">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Copied" : "Copy command"}</Button>
      <p className="text-xs leading-5 text-muted-foreground">The copied command includes your current access token. After sending the event, refresh your logs.</p>
    </DialogContent>
  </Dialog>
}
