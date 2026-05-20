export type AssistMessageRole = "user" | "assistant" | "system"

export type AssistMessage = {
  id: string
  role: AssistMessageRole
  content: string
  createdAt: string
}

export type AssistConversation = {
  id: string
  title: string
  messages: AssistMessage[]
  createdAt: string
  updatedAt: string
  context?: AssistContext
}

export type AssistContext = "general" | "logs" | "dashboards" | "alerts"
