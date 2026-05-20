"use client"

import * as React from "react"
import {
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  RadioIcon,
  ServerIcon,
  WebhookIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type IntegrationId = "agent" | "api"

const STEPS = [
  { id: 1, label: "Choose integration" },
  { id: 2, label: "Install & configure" },
  { id: 3, label: "Verify ingestion" },
] as const

const INTEGRATIONS: {
  id: IntegrationId
  title: string
  description: string
  recommended?: boolean
  icon: React.ComponentType<{ className?: string }>
  learnMoreHref: string
}[] = [
  {
    id: "agent",
    title: "Logify agent",
    description:
      "Install on hosts or Kubernetes to collect logs automatically. Best for infrastructure, containers, and services without code changes.",
    recommended: true,
    icon: ServerIcon,
    learnMoreHref: "#",
  },
  {
    id: "api",
    title: "Logify ingestion API",
    description:
      "Send logs over HTTPS from applications, scripts, or custom forwarders. Ideal when you control the emit path or need a push-only pipeline.",
    icon: WebhookIcon,
    learnMoreHref: "#",
  },
]

function getIngestionApiUrl() {
  const base = (
    process.env.NEXT_PUBLIC_LOGIFY_API_BASE_URL ?? "http://127.0.0.1:8080"
  ).replace(/\/$/, "")
  return `${base}/v1/logs/ingest`
}

export type LogIngestionSetupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogIngestionSetupDialog({
  open,
  onOpenChange,
}: LogIngestionSetupDialogProps) {
  const [step, setStep] = React.useState(1)
  const [integration, setIntegration] = React.useState<IntegrationId>("agent")
  const [copied, setCopied] = React.useState(false)

  const ingestionUrl = getIngestionApiUrl()
  const tenantId =
    process.env.NEXT_PUBLIC_LOGIFY_TENANT_ID ?? "acme-corp"

  React.useEffect(() => {
    if (!open) {
      setStep(1)
      setIntegration("agent")
      setCopied(false)
    }
  }, [open])

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1)
    else onOpenChange(false)
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const copyEndpoint = () => {
    void navigator.clipboard.writeText(ingestionUrl).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90vh,720px)] w-full max-w-[min(920px,calc(100%-2rem))] flex-col gap-0 overflow-hidden rounded-lg p-0 sm:max-w-[min(920px,calc(100%-2rem))]"
      >
        <DialogTitle className="sr-only">Set up log ingestion</DialogTitle>

        <header className="shrink-0 border-b border-border px-6 py-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            Set up log ingestion
          </h2>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <nav
            className="hidden w-[220px] shrink-0 flex-col gap-1 border-r border-border bg-muted/25 px-4 py-5 sm:flex"
            aria-label="Setup steps"
          >
            {STEPS.map((s) => {
              const active = step === s.id
              const done = step > s.id
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 text-[13px]",
                    active && "bg-background shadow-sm ring-1 ring-border/80",
                    !active && !done && "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums-lining",
                      active &&
                        "border-primary bg-primary/10 text-primary",
                      done && "border-primary/40 bg-primary text-primary-foreground",
                      !active && !done && "border-border bg-background"
                    )}
                  >
                    {done ? <CheckIcon className="size-3.5" /> : s.id}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 truncate font-medium",
                      active && "text-foreground",
                      done && "text-foreground/80"
                    )}
                  >
                    {s.label}
                  </span>
                  {active ? (
                    <ChevronRightIcon className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
                  ) : null}
                </div>
              )
            })}
          </nav>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
                Follow the steps below to start sending logs to Logify. See the{" "}
                <a
                  href="#"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  ingestion guide
                </a>{" "}
                for security, retention, and high-volume deployment.
              </p>

              {step === 1 ? (
                <StepChooseIntegration
                  value={integration}
                  onChange={setIntegration}
                />
              ) : null}

              {step === 2 ? (
                <StepInstall
                  integration={integration}
                  ingestionUrl={ingestionUrl}
                  tenantId={tenantId}
                  copied={copied}
                  onCopy={copyEndpoint}
                />
              ) : null}

              {step === 3 ? (
                <StepVerify integration={integration} />
              ) : null}
            </div>

            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-muted/15 px-5 py-3.5 sm:px-6">
              <span className="text-[12px] text-muted-foreground">
                Step {step} of {STEPS.length}
              </span>
              <div className="flex items-center gap-2">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-[12.5px]"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  className="h-8 min-w-[88px] px-4 text-[12.5px] font-medium"
                  onClick={handleNext}
                >
                  {step === 3 ? "Done" : "Next"}
                </Button>
              </div>
            </footer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StepChooseIntegration({
  value,
  onChange,
}: {
  value: IntegrationId
  onChange: (id: IntegrationId) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground">
          Choose log integration
        </h3>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Pick how you want to deliver logs into this environment.
        </p>
      </div>

      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as IntegrationId)}
        className="grid gap-3 sm:grid-cols-2"
      >
        {INTEGRATIONS.map((item) => {
          const Icon = item.icon
          const selected = value === item.id
          return (
            <label
              key={item.id}
              className={cn(
                "relative flex cursor-pointer flex-col rounded-lg border bg-card p-4 transition-all",
                selected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-border/80 hover:bg-muted/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <RadioGroupItem
                  value={item.id}
                  id={`integration-${item.id}`}
                  className="mt-0.5"
                />
                {item.recommended ? (
                  <Badge
                    variant="secondary"
                    className="h-5 rounded-md border border-primary/20 bg-primary/10 px-1.5 text-[10px] font-semibold text-primary"
                  >
                    Recommended
                  </Badge>
                ) : null}
              </div>

              <div className="mt-4 flex flex-1 flex-col items-center text-center">
                <span
                  className={cn(
                    "mb-3 flex size-12 items-center justify-center rounded-lg border",
                    selected
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground"
                  )}
                >
                  <Icon className="size-6" />
                </span>
                <span className="text-[13px] font-semibold text-foreground">
                  {item.title}
                </span>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <a
                href={item.learnMoreHref}
                className="mt-4 inline-flex items-center justify-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Learn more
                <ExternalLinkIcon className="size-3" />
              </a>
            </label>
          )
        })}
      </RadioGroup>
    </div>
  )
}

function StepInstall({
  integration,
  ingestionUrl,
  tenantId,
  copied,
  onCopy,
}: {
  integration: IntegrationId
  ingestionUrl: string
  tenantId: string
  copied: boolean
  onCopy: () => void
}) {
  if (integration === "agent") {
    return (
      <div className="space-y-5">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">
            Install Logify agent
          </h3>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Deploy the agent on your host or cluster. It tails log files and
            forwards them to Logify with your tenant credentials.
          </p>
        </div>

        <InstallBlock title="Linux / macOS">
          <pre className="font-code overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-[12px] leading-relaxed text-foreground">
            {`curl -fsSL https://get.logify.io/agent | sh -s -- \\
  --tenant-id="${tenantId}" \\
  --environment=production`}
          </pre>
        </InstallBlock>

        <InstallBlock title="Kubernetes (Helm)">
          <pre className="font-code overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-[12px] leading-relaxed text-foreground">
            {`helm repo add logify https://charts.logify.io
helm install logify-agent logify/agent \\
  --set tenantId=${tenantId} \\
  --set cluster.name=production`}
          </pre>
        </InstallBlock>

        <p className="text-[12px] text-muted-foreground">
          After install, the agent registers automatically. Allow 1–2 minutes
          before verifying on the next step.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground">
          Configure Logify ingestion API
        </h3>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          POST JSON log events to the endpoint below. Include your tenant ID and
          an API key with ingest scope.
        </p>
      </div>

      <InstallBlock title="Ingestion endpoint">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2 pl-3">
          <code className="font-code min-w-0 flex-1 truncate text-[12px] text-foreground">
            {ingestionUrl}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-8 shrink-0"
            onClick={onCopy}
            aria-label="Copy endpoint"
          >
            {copied ? (
              <CheckIcon className="size-3.5 text-primary" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
          </Button>
        </div>
      </InstallBlock>

      <InstallBlock title="Example request">
        <pre className="font-code overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-[12px] leading-relaxed text-foreground">
          {`curl -X POST "${ingestionUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-Logify-Tenant: ${tenantId}" \\
  -H "Authorization: Bearer <your-api-key>" \\
  -d '{
    "logs": [{
      "timestamp": "${new Date().toISOString()}",
      "severity": "info",
      "service": "payments-api",
      "body": "Order processed"
    }]
  }'`}
        </pre>
      </InstallBlock>
    </div>
  )
}

function StepVerify({ integration }: { integration: IntegrationId }) {
  const checks = [
    {
      label:
        integration === "agent"
          ? "Agent connected and reporting heartbeat"
          : "API credentials accepted",
      done: true,
    },
    {
      label: "First log batch received in the last 5 minutes",
      done: true,
    },
    {
      label: "Logs visible in the explorer for this tenant",
      done: false,
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground">
          Verify ingestion setup
        </h3>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          {integration === "agent"
            ? "Confirm the agent is shipping logs. Run a test emit or wait for natural traffic."
            : "Send a test payload, then confirm events appear in Logs."}
        </p>
      </div>

      <ul className="space-y-2.5 rounded-lg border border-border bg-card p-4">
        {checks.map((check) => (
          <li
            key={check.label}
            className="flex items-start gap-3 text-[13px]"
          >
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                check.done
                  ? "bg-primary/15 text-primary"
                  : "border border-dashed border-border bg-muted/30 text-muted-foreground"
              )}
            >
              {check.done ? (
                <CheckIcon className="size-3" />
              ) : (
                <RadioIcon className="size-3 opacity-50" />
              )}
            </span>
            <span
              className={cn(
                check.done ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {check.label}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-[12px] text-muted-foreground">
        Open the{" "}
        <a
          href="/dashboard/logs"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Logs explorer
        </a>{" "}
        and click <strong className="font-medium text-foreground">Run</strong>{" "}
        to refresh. Ingestion can take up to a minute to appear.
      </p>
    </div>
  )
}

function InstallBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-medium text-foreground">{title}</p>
      {children}
    </div>
  )
}
