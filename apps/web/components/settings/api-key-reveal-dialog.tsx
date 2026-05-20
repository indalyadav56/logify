"use client"

import * as React from "react"
import { AlertTriangleIcon, CheckIcon, CopyIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function ApiKeyRevealDialog({
  open,
  onOpenChange,
  keyName,
  secret,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  keyName: string
  secret: string | null
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  const copy = async () => {
    if (!secret) return
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      toast.success("API key copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Save your API key</DialogTitle>
          <DialogDescription>
            Copy <span className="font-medium text-foreground">{keyName}</span>{" "}
            now. For security, the full secret is shown only once.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
          <div className="flex gap-2">
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-[12px] leading-relaxed text-amber-950 dark:text-amber-100">
              Store this key in a secrets manager or environment variable. Anyone
              with this key can access your organization within the granted scopes.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[12px] font-medium text-foreground">API key</p>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={secret ?? ""}
              className="font-code h-10 text-[12px]"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 shrink-0"
              onClick={copy}
              disabled={!secret}
              aria-label="Copy API key"
            >
              {copied ? (
                <CheckIcon className="size-4 text-primary" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
