import type { ApiKeyScope } from "@/lib/settings/types"

export const API_KEY_SCOPES: {
  id: ApiKeyScope
  label: string
  description: string
  dangerous?: boolean
}[] = [
  {
    id: "logs.ingest",
    label: "Ingest logs",
    description: "Send log events via the ingestion API or agent",
  },
  {
    id: "logs.read",
    label: "Read logs",
    description: "Search and export log data",
  },
  {
    id: "alerts.read",
    label: "Read alerts",
    description: "View alert rules and firing history",
  },
  {
    id: "alerts.write",
    label: "Manage alerts",
    description: "Create and update alert rules",
  },
  {
    id: "projects.read",
    label: "Read projects",
    description: "List projects and metadata",
  },
  {
    id: "admin",
    label: "Full access",
    description: "Unrestricted API access — use sparingly",
    dangerous: true,
  },
]

export const API_KEY_EXPIRY_OPTIONS = [
  { id: "never", label: "Never expires" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "1y", label: "1 year" },
] as const

export type ApiKeyExpiryOptionId =
  (typeof API_KEY_EXPIRY_OPTIONS)[number]["id"]

export function expiryOptionToDate(
  option: ApiKeyExpiryOptionId
): string | null {
  if (option === "never") return null
  const now = Date.now()
  const days =
    option === "30d" ? 30 : option === "90d" ? 90 : option === "1y" ? 365 : 0
  return new Date(now + days * 86_400_000).toISOString()
}

export function formatApiKeyPrefix(secret: string) {
  return secret.slice(0, 16) + "…"
}

export function generateApiKeySecret(environment: string) {
  const envSlug =
    environment === "production"
      ? "live"
      : environment === "staging"
        ? "stg"
        : "dev"
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  const token = Array.from(bytes, (b) =>
    (b % 36).toString(36)
  ).join("")
  return `lgfy_${envSlug}_${token}`
}
