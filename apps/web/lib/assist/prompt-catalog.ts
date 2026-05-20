import type { AssistContext } from "@/lib/assist/types"

export type SlashCommand = {
  id: string
  command: string
  label: string
  description: string
  insert: string
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "explain",
    command: "/explain",
    label: "Explain",
    description: "Summarize what happened in a time range",
    insert: "/explain What caused the error spike in the last hour?",
  },
  {
    id: "query",
    command: "/query",
    label: "Log query",
    description: "Generate a Logify query from natural language",
    insert: '/query Show error logs for service:"checkout-api" in the last 30 minutes',
  },
  {
    id: "dashboard",
    command: "/dashboard",
    label: "Dashboard",
    description: "Suggest widgets or layout changes",
    insert: "/dashboard Add a log volume chart and error rate KPI for payments",
  },
  {
    id: "alert",
    command: "/alert",
    label: "Alert",
    description: "Draft an alert rule from symptoms",
    insert: "/alert Create an alert when 5xx rate exceeds 2% for 10 minutes on checkout-api",
  },
  {
    id: "compare",
    command: "/compare",
    label: "Compare",
    description: "Compare two time windows or deploys",
    insert: "/compare Error rate now vs same time yesterday for checkout-api",
  },
]

export const CONTEXT_PROMPTS: Record<
  AssistContext,
  { label: string; prompts: string[] }
> = {
  general: {
    label: "Observability",
    prompts: [
      "What changed before the latest error spike?",
      "Summarize open incidents across production",
      "Which services have the highest log volume today?",
    ],
  },
  logs: {
    label: "Logs",
    prompts: [
      "Build a query for timeout errors on payments-api",
      "Why did warn-level logs increase in the last 2 hours?",
      "Find logs matching trace id from checkout failures",
    ],
  },
  dashboards: {
    label: "Dashboards",
    prompts: [
      "Add variables for environment and service",
      "Suggest tiles for SLO burn and error budget",
      "Visualize ingest volume vs error rate on one board",
    ],
  },
  alerts: {
    label: "Alerts",
    prompts: [
      "Tune noisy alerts on search-svc",
      "Draft a multi-window burn rate alert for checkout",
      "List alerts that fired more than 5 times today",
    ],
  },
}

export function filterSlashCommands(query: string) {
  const trimmed = query.trimStart()
  if (!trimmed.startsWith("/")) return []
  const token = trimmed.split(/\s/)[0]?.toLowerCase() ?? ""
  if (token === "/") return SLASH_COMMANDS
  return SLASH_COMMANDS.filter(
    (c) => c.command.startsWith(token) || c.label.toLowerCase().includes(token.slice(1))
  )
}
