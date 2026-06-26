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
import { Textarea } from "@/components/ui/textarea"

type Props = Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>

export function CreateProjectDialog({ open, onOpenChange }: Props) {
  const { createProject } = useProjectStore()
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setName("")
    setDescription("")
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
      const desc = description.trim()
      await createProject({ name: trimmed, description: desc || undefined })
      toast.success("Project created", {
        description: `${trimmed} is ready.`,
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

          <div className="space-y-2">
            <Label htmlFor="project-description" className="text-[12.5px]">
              Description
              <span className="ml-1 font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="project-description"
              placeholder="What is this project for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 rounded-xl"
              rows={3}
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
