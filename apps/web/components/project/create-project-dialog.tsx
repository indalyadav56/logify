"use client"

import * as React from "react"
import { LoaderIcon } from "lucide-react"
import { toast } from "sonner"

import { useProjectStore } from "@/lib/project-store"
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
import { Label } from "@/components/ui/label"

type Props = Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>

export function CreateProjectDialog({ open, onOpenChange }: Props) {
  const { createProject } = useProjectStore()
  const [name, setName] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setName("")
    setSubmitting(false)
  }, [open])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      toast.error("Enter a project name (at least 2 characters).")
      return
    }
    setSubmitting(true)
    try {
      await createProject({ name: trimmed })
      toast.success("Project created", {
        description: `${trimmed} is ready. You're the Admin.`,
      })
      onOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't create the project."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton
      >
        <div className="border-b border-border/60 bg-muted/30 px-6 py-5">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-[17px]">Create a project</DialogTitle>
            <DialogDescription className="text-[13px]">
              Projects isolate data, members, and billing. You can invite your
              team after setup.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-[12.5px]">
              Project name
            </Label>
            <Input
              id="project-name"
              autoComplete="organization"
              placeholder="e.g. Acme Platform"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl"
              autoFocus
              required
            />
          </div>

          <DialogFooter className="gap-2 border-t border-border/60 pt-5 pb-1">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[120px] rounded-xl"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" /> Creating…
                </>
              ) : (
                "Create project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
