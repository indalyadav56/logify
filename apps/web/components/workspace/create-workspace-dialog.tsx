"use client"

import * as React from "react"
import { LoaderIcon } from "lucide-react"
import { toast } from "sonner"

import type { WorkspaceSummary } from "@/lib/workspace"
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

type Props = Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (workspace: WorkspaceSummary) => void
  /** Existing workspace ids / URL slugs — blocks duplicates. */
  takenIds?: readonly string[]
}>

const REGIONS = [
  { id: "us-east-1", label: "US East (N. Virginia)" },
  { id: "eu-west-1", label: "EU West (Ireland)" },
  { id: "ap-south-1", label: "Asia Pacific (Mumbai)" },
] as const

const PLANS = [
  { id: "starter", label: "Starter — free tier" },
  { id: "pro", label: "Pro — 30-day trial" },
  { id: "enterprise", label: "Enterprise — contact sales" },
] as const

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
  takenIds = [],
}: Props) {
  const [name, setName] = React.useState("")
  const [slugManual, setSlugManual] = React.useState(false)
  const [slug, setSlug] = React.useState("")
  const [region, setRegion] = React.useState<(typeof REGIONS)[number]["id"]>(
    "us-east-1"
  )
  const [plan, setPlan] = React.useState<(typeof PLANS)[number]["id"]>("pro")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setName("")
    setSlugManual(false)
    setSlug("")
    setRegion("us-east-1")
    setPlan("pro")
    setSubmitting(false)
  }, [open])

  React.useEffect(() => {
    if (slugManual || !open) return
    setSlug(slugify(name))
  }, [name, slugManual, open])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      toast.error("Enter a workspace name (at least 2 characters).")
      return
    }
    let s = slug.trim() || slugify(trimmed)
    if (!s) {
      toast.error("Add a few letters to your workspace name to set a URL.")
      return
    }
    if (!isValidSlug(s)) {
      toast.error(
        "URL slug must be 3–40 characters: lowercase letters, numbers, and hyphens."
      )
      return
    }
    if (takenIds.includes(s)) {
      toast.error("That URL slug is already used in this account.")
      return
    }

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))

    const ws: WorkspaceSummary = {
      id: s,
      name: trimmed,
      role: "Admin",
      initials: initialsFromName(trimmed),
    }

    toast.success("Workspace created", {
      description: `${trimmed} is ready. You're the Admin.`,
    })
    onCreated(ws)
    onOpenChange(false)
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <div className="border-b border-border/60 bg-muted/30 px-6 py-5">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-[17px]">
              Create a workspace
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Workspaces isolate data, members, and billing. You can invite your
              team after setup.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="ws-name" className="text-[12.5px]">
              Workspace name
            </Label>
            <Input
              id="ws-name"
              autoComplete="organization"
              placeholder="e.g. Acme Platform"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ws-slug" className="text-[12.5px]">
                URL slug
              </Label>
              {slugManual ? (
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  onClick={() => {
                    setSlugManual(false)
                    setSlug(slugify(name))
                  }}
                >
                  Reset from name
                </button>
              ) : (
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  onClick={() => setSlugManual(true)}
                >
                  Edit
                </button>
              )}
            </div>
            <div className="flex rounded-xl border border-border/60 bg-muted/20">
              <span className="shrink-0 border-r border-border/60 px-3 py-2 font-mono text-[11.5px] text-muted-foreground">
                app.logify.io/
              </span>
              <Input
                id="ws-slug"
                autoComplete="off"
                spellCheck={false}
                value={slug}
                onChange={(e) => {
                  setSlugManual(true)
                  setSlug(e.target.value.toLowerCase())
                }}
                placeholder={slugify(name || "my-workspace")}
                className="h-10 flex-1 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Used in links and API keys. Letters, numbers, hyphens only.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ws-region" className="text-[12.5px]">
                Data region
              </Label>
              <NativeSelect
                id="ws-region"
                className="w-full"
                value={region}
                onChange={(e) =>
                  setRegion(e.target.value as (typeof REGIONS)[number]["id"])
                }
              >
                {REGIONS.map((r) => (
                  <NativeSelectOption key={r.id} value={r.id}>
                    {r.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-plan" className="text-[12.5px]">
                Plan
              </Label>
              <NativeSelect
                id="ws-plan"
                className="w-full"
                value={plan}
                onChange={(e) =>
                  setPlan(e.target.value as (typeof PLANS)[number]["id"])
                }
              >
                {PLANS.map((p) => (
                  <NativeSelectOption key={p.id} value={p.id}>
                    {p.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
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
                "Create workspace"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 40)
}

function isValidSlug(s: string) {
  if (s.length < 3 || s.length > 40) return false
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) {
    const w = parts[0]
    return w.length >= 2
      ? w.slice(0, 2).toUpperCase()
      : (w[0] + w[0]).toUpperCase()
  }
  const first = parts[0][0]
  const lastPart = parts.at(-1)
  const last = lastPart?.[0]
  if (!first || !last) return "?"
  return (first + last).toUpperCase()
}
