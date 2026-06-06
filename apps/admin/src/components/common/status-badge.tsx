import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const tones = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  neutral: "bg-muted text-muted-foreground",
} as const

export type Tone = keyof typeof tones

export function ToneBadge({
  tone,
  children,
  className,
}: {
  tone: Tone
  children: React.ReactNode
  className?: string
}) {
  return (
    <Badge variant="secondary" className={cn(tones[tone], "border-transparent", className)}>
      {children}
    </Badge>
  )
}

const userStatusTone: Record<string, Tone> = {
  active: "success",
  invited: "info",
  suspended: "danger",
}

const orgStatusTone: Record<string, Tone> = {
  active: "success",
  trial: "info",
  past_due: "danger",
  cancelled: "neutral",
}

const planTone: Record<string, Tone> = {
  free: "neutral",
  starter: "info",
  growth: "success",
  enterprise: "warning",
}

const incidentTone: Record<string, Tone> = {
  resolved: "success",
  monitoring: "info",
  identified: "warning",
  investigating: "danger",
}

const severityTone: Record<string, Tone> = {
  low: "info",
  medium: "warning",
  high: "danger",
  critical: "danger",
}

const envTone: Record<string, Tone> = {
  production: "danger",
  staging: "warning",
  development: "info",
}

export function UserStatusBadge({ status }: { status: string }) {
  return <ToneBadge tone={userStatusTone[status] ?? "neutral"}>{status}</ToneBadge>
}
export function OrgStatusBadge({ status }: { status: string }) {
  return (
    <ToneBadge tone={orgStatusTone[status] ?? "neutral"}>{status.replace("_", " ")}</ToneBadge>
  )
}
export function PlanBadge({ plan }: { plan: string }) {
  return <ToneBadge tone={planTone[plan] ?? "neutral"}>{plan}</ToneBadge>
}
export function IncidentStatusBadge({ status }: { status: string }) {
  return <ToneBadge tone={incidentTone[status] ?? "neutral"}>{status}</ToneBadge>
}
export function SeverityBadge({ severity }: { severity: string }) {
  return <ToneBadge tone={severityTone[severity] ?? "neutral"}>{severity}</ToneBadge>
}
export function EnvBadge({ env }: { env: string }) {
  return <ToneBadge tone={envTone[env] ?? "neutral"}>{env}</ToneBadge>
}
