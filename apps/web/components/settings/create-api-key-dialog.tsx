"use client"

import * as React from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  API_KEY_EXPIRY_OPTIONS,
  API_KEY_SCOPES,
  expiryOptionToDate,
  generateApiKeySecret,
  type ApiKeyExpiryOptionId,
} from "@/lib/settings/api-keys-catalog"
import type {
  ApiKey,
  ApiKeyEnvironment,
  ApiKeyScope,
} from "@/lib/settings/types"

export type CreateApiKeyResult = {
  key: ApiKey
  secret: string
}

export function CreateApiKeyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (result: CreateApiKeyResult) => void
}) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [environment, setEnvironment] =
    React.useState<ApiKeyEnvironment>("production")
  const [expiry, setExpiry] = React.useState<ApiKeyExpiryOptionId>("never")
  const [scopes, setScopes] = React.useState<ApiKeyScope[]>(["logs.ingest"])

  const reset = () => {
    setName("")
    setDescription("")
    setEnvironment("production")
    setExpiry("never")
    setScopes(["logs.ingest"])
  }

  const toggleScope = (scope: ApiKeyScope, checked: boolean) => {
    if (scope === "admin" && checked) {
      setScopes(["admin"])
      return
    }
    setScopes((prev) => {
      const withoutAdmin = prev.filter((s) => s !== "admin")
      if (checked) return [...withoutAdmin, scope]
      return withoutAdmin.filter((s) => s !== scope)
    })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Enter a name for this key")
      return
    }
    if (scopes.length === 0) {
      toast.error("Select at least one scope")
      return
    }

    const secret = generateApiKeySecret(environment)
    const prefix = secret.slice(0, 20)
    const key: ApiKey = {
      id: `key-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      prefix,
      status: "active",
      scopes: [...scopes],
      environment,
      createdAt: new Date().toISOString(),
      createdBy: "Avery Moore",
      lastUsedAt: null,
      expiresAt: expiryOptionToDate(expiry),
    }

    onCreated({ key, secret })
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent className="flex max-h-[min(640px,90vh)] flex-col gap-0 overflow-hidden sm:max-w-lg">
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Generate a key for programmatic access. Use scoped keys instead of
              sharing your personal credentials.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
            <div>
              <Label className="mb-1.5 text-[12px]">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production ingestion"
                className="h-9 text-[13px]"
                autoFocus
              />
            </div>
            <div>
              <Label className="mb-1.5 text-[12px]">Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this key is used for"
                className="min-h-[64px] resize-none text-[13px]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 text-[12px]">Environment</Label>
                <Select
                  value={environment}
                  onValueChange={(v) =>
                    setEnvironment(v as ApiKeyEnvironment)
                  }
                >
                  <SelectTrigger className="h-9 w-full text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production" className="text-[13px]">
                      Production
                    </SelectItem>
                    <SelectItem value="staging" className="text-[13px]">
                      Staging
                    </SelectItem>
                    <SelectItem value="development" className="text-[13px]">
                      Development
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-[12px]">Expiration</Label>
                <Select
                  value={expiry}
                  onValueChange={(v) =>
                    setExpiry(v as ApiKeyExpiryOptionId)
                  }
                >
                  <SelectTrigger className="h-9 w-full text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {API_KEY_EXPIRY_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.id}
                        value={opt.id}
                        className="text-[13px]"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-[12px]">Scopes</Label>
              <ul className="space-y-2 rounded-md border border-border">
                {API_KEY_SCOPES.map((scope) => {
                  const checked = scopes.includes(scope.id)
                  const disabled =
                    scopes.includes("admin") && scope.id !== "admin"

                  return (
                    <li
                      key={scope.id}
                      className={cn(
                        "flex items-start gap-3 border-b border-border/60 px-3 py-2.5 last:border-0",
                        scope.dangerous && "bg-destructive/5"
                      )}
                    >
                      <Checkbox
                        id={`scope-${scope.id}`}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(v) =>
                          toggleScope(scope.id, v === true)
                        }
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={`scope-${scope.id}`}
                        className="min-w-0 cursor-pointer"
                      >
                        <span className="text-[13px] font-medium text-foreground">
                          {scope.label}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-muted-foreground">
                          {scope.description}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border/60 pt-4 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create key</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
