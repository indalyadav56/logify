"use client"

import * as React from "react"
import Link from "next/link"
import {
  CopyIcon,
  KeyRoundIcon,
  MoreVerticalIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ApiKeyRevealDialog } from "@/components/settings/api-key-reveal-dialog"
import {
  CreateApiKeyDialog,
  type CreateApiKeyResult,
} from "@/components/settings/create-api-key-dialog"
import { SettingsSection } from "@/components/settings/settings-section"
import {
  API_KEY_SCOPES,
  generateApiKeySecret,
} from "@/lib/settings/api-keys-catalog"
import { MOCK_API_KEYS } from "@/lib/settings/mock-data"
import type { ApiKey, ApiKeyStatus } from "@/lib/settings/types"

function formatRelative(iso: string | null) {
  if (!iso) return "Never"
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const STATUS_STYLES: Record<ApiKeyStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  revoked: "bg-muted text-muted-foreground",
  expired: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
}

const ENV_LABELS = {
  production: "Production",
  staging: "Staging",
  development: "Development",
} as const

function scopeLabel(scope: string) {
  return API_KEY_SCOPES.find((s) => s.id === scope)?.label ?? scope
}

export function ApiKeysManagementPanel() {
  const [keys, setKeys] = React.useState(MOCK_API_KEYS)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("active")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [revealOpen, setRevealOpen] = React.useState(false)
  const [revealedSecret, setRevealedSecret] = React.useState<string | null>(
    null
  )
  const [revealedName, setRevealedName] = React.useState("")
  const [revokeTarget, setRevokeTarget] = React.useState<ApiKey | null>(null)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return keys.filter((k) => {
      if (statusFilter !== "all" && k.status !== statusFilter) return false
      if (!q) return true
      return (
        k.name.toLowerCase().includes(q) ||
        k.prefix.toLowerCase().includes(q) ||
        k.scopes.some((s) => s.toLowerCase().includes(q))
      )
    })
  }, [keys, search, statusFilter])

  const handleCreated = ({ key, secret }: CreateApiKeyResult) => {
    setKeys((prev) => [key, ...prev])
    setRevealedSecret(secret)
    setRevealedName(key.name)
    setRevealOpen(true)
  }

  const rotateKey = (target: ApiKey) => {
    const secret = generateApiKeySecret(target.environment)
    const prefix = secret.slice(0, 20)
    const replacement: ApiKey = {
      ...target,
      id: `key-${Date.now()}`,
      prefix,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      status: "active",
      revokedAt: undefined,
    }
    setKeys((prev) =>
      prev.map((k) =>
        k.id === target.id
          ? {
              ...k,
              status: "revoked" as const,
              revokedAt: new Date().toISOString(),
            }
          : k
      ).concat(replacement)
    )
    setRevealedSecret(secret)
    setRevealedName(replacement.name)
    setRevealOpen(true)
    toast.success("API key rotated", {
      description: "The previous key was revoked.",
    })
  }

  const confirmRevoke = () => {
    if (!revokeTarget) return
    setKeys((prev) =>
      prev.map((k) =>
        k.id === revokeTarget.id
          ? {
              ...k,
              status: "revoked" as const,
              revokedAt: new Date().toISOString(),
            }
          : k
      )
    )
    toast.success("API key revoked", { description: revokeTarget.name })
    setRevokeTarget(null)
  }

  const copyPrefix = async (prefix: string) => {
    try {
      await navigator.clipboard.writeText(prefix)
      toast.success("Key prefix copied")
    } catch {
      toast.error("Could not copy")
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <SettingsSection
        title="API keys"
        description="Authenticate agents, CI pipelines, and integrations. Keys are scoped and can expire."
        action={
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <PlusIcon className="size-3.5" />
            Create API key
          </Button>
        }
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, prefix, or scope"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-[13px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[140px] text-[13px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px]">Name</TableHead>
                <TableHead className="text-[12px]">Key</TableHead>
                <TableHead className="text-[12px]">Scopes</TableHead>
                <TableHead className="text-[12px]">Last used</TableHead>
                <TableHead className="text-[12px]">Expires</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-[13px] text-muted-foreground"
                  >
                    No API keys match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((key) => (
                  <ApiKeyRow
                    key={key.id}
                    apiKey={key}
                    onCopyPrefix={() => copyPrefix(key.prefix)}
                    onRotate={() => rotateKey(key)}
                    onRevoke={() => setRevokeTarget(key)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">
          {filtered.length} key{filtered.length === 1 ? "" : "s"} shown
        </p>
      </SettingsSection>

      <SettingsSection
        title="Using API keys"
        description="Include your key in the Authorization header for HTTP requests."
      >
        <div className="space-y-4">
          <pre className="font-code overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-[12px] leading-relaxed text-foreground">
            {`curl -X POST "$LOGIFY_API_URL/v1/logs/ingest" \\
  -H "Authorization: Bearer $LOGIFY_API_KEY" \\
  -H "X-Logify-Tenant: $LOGIFY_TENANT_ID" \\
  -H "Content-Type: application/json" \\
  -d '{"logs":[...]}'`}
          </pre>
          <p className="text-[12px] text-muted-foreground">
            Need step-by-step setup? Use{" "}
            <Link
              href="/dashboard/logs"
              className="font-medium text-primary hover:underline"
            >
              Logs → New
            </Link>{" "}
            to configure the agent or ingestion API with a new key.
          </p>
        </div>
      </SettingsSection>

      <CreateApiKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />

      <ApiKeyRevealDialog
        open={revealOpen}
        onOpenChange={setRevealOpen}
        keyName={revealedName}
        secret={revealedSecret}
      />

      <AlertDialog
        open={revokeTarget != null}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {revokeTarget?.name}
              </span>{" "}
              will stop working immediately. Applications using this key will
              receive 401 responses until you issue a replacement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmRevoke}
            >
              Revoke key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ApiKeyRow({
  apiKey,
  onCopyPrefix,
  onRotate,
  onRevoke,
}: {
  apiKey: ApiKey
  onCopyPrefix: () => void
  onRotate: () => void
  onRevoke: () => void
}) {
  const isActive = apiKey.status === "active"

  return (
    <TableRow className={cn(!isActive && "opacity-60")}>
      <TableCell>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[13px] font-medium">{apiKey.name}</p>
            <Badge
              variant="secondary"
              className={cn(
                "h-5 rounded-md px-1.5 text-[10px] font-medium capitalize",
                STATUS_STYLES[apiKey.status]
              )}
            >
              {apiKey.status}
            </Badge>
            <Badge
              variant="outline"
              className="h-5 rounded-md px-1.5 text-[10px] font-medium"
            >
              {ENV_LABELS[apiKey.environment]}
            </Badge>
          </div>
          {apiKey.description ? (
            <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
              {apiKey.description}
            </p>
          ) : null}
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Created {formatDate(apiKey.createdAt)} by {apiKey.createdBy}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <code className="font-code text-[12px] text-foreground">
            {apiKey.prefix}…
          </code>
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-7"
            onClick={onCopyPrefix}
            aria-label="Copy key prefix"
          >
            <CopyIcon className="size-3.5" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex max-w-[200px] flex-wrap gap-1">
          {apiKey.scopes.map((scope) => (
            <Badge
              key={scope}
              variant="secondary"
              className="rounded-md px-1.5 text-[10px] font-normal"
            >
              {scopeLabel(scope)}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-[12px] text-muted-foreground">
        {formatRelative(apiKey.lastUsedAt)}
      </TableCell>
      <TableCell className="text-[12px] text-muted-foreground">
        {formatDate(apiKey.expiresAt)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-8"
              disabled={!isActive}
            >
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onCopyPrefix}>
              <KeyRoundIcon className="size-3.5" />
              Copy prefix
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRotate}>
              <RefreshCwIcon className="size-3.5" />
              Rotate key
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={onRevoke}
            >
              <Trash2Icon className="size-3.5" />
              Revoke
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
