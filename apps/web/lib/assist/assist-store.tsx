"use client"

import * as React from "react"

import { generateAssistReply } from "@/lib/assist/mock-responses"
import type {
  AssistContext,
  AssistConversation,
  AssistMessage,
} from "@/lib/assist/types"

const STORAGE_KEY = "logify:assist"
const WELCOME_KEY = "logify:assist-welcome-dismissed"

function now() {
  return new Date().toISOString()
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function defaultConversation(): AssistConversation {
  const t = now()
  return {
    id: createId("conv"),
    title: "Untitled conversation",
    messages: [],
    createdAt: t,
    updatedAt: t,
    context: "general",
  }
}

type AssistStoreValue = {
  conversations: AssistConversation[]
  activeId: string
  active: AssistConversation
  welcomeDismissed: boolean
  dismissWelcome: () => void
  newConversation: (context?: AssistContext) => void
  selectConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  deleteConversation: (id: string) => void
  setContext: (context: AssistContext) => void
  sendMessage: (content: string) => Promise<void>
  isThinking: boolean
}

const AssistCtx = React.createContext<AssistStoreValue | null>(null)

function loadState(): {
  conversations: AssistConversation[]
  activeId: string
} | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as {
      conversations: AssistConversation[]
      activeId: string
    }
  } catch {
    return null
  }
}

function titleFromMessage(content: string) {
  const line = content.trim().split("\n")[0] ?? "Untitled conversation"
  const cleaned = line.replace(/^\/\w+\s*/, "").trim()
  if (cleaned.length <= 48) return cleaned || "Untitled conversation"
  return `${cleaned.slice(0, 45)}…`
}

export function AssistStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const initial = defaultConversation()
  const [conversations, setConversations] = React.useState<AssistConversation[]>(
    [initial]
  )
  const [activeId, setActiveId] = React.useState(initial.id)
  const [welcomeDismissed, setWelcomeDismissed] = React.useState(false)
  const [isThinking, setIsThinking] = React.useState(false)

  React.useEffect(() => {
    const saved = loadState()
    if (saved?.conversations.length) {
      setConversations(saved.conversations)
      setActiveId(
        saved.conversations.some((c) => c.id === saved.activeId)
          ? saved.activeId
          : saved.conversations[0].id
      )
    }
    try {
      setWelcomeDismissed(
        window.localStorage.getItem(WELCOME_KEY) === "true"
      )
    } catch {
      /* ignore */
    }
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ conversations, activeId })
      )
    } catch {
      /* ignore */
    }
  }, [conversations, activeId])

  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0]

  const dismissWelcome = React.useCallback(() => {
    setWelcomeDismissed(true)
    try {
      window.localStorage.setItem(WELCOME_KEY, "true")
    } catch {
      /* ignore */
    }
  }, [])

  const newConversation = React.useCallback((context?: AssistContext) => {
    const conv = defaultConversation()
    if (context) conv.context = context
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
  }, [])

  const selectConversation = React.useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const renameConversation = React.useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: title.trim() || c.title, updatedAt: now() } : c
      )
    )
  }, [])

  const deleteConversation = React.useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id)
      if (next.length === 0) {
        const fresh = defaultConversation()
        setActiveId(fresh.id)
        return [fresh]
      }
      if (activeId === id) setActiveId(next[0].id)
      return next
    })
  }, [activeId])

  const setContext = React.useCallback(
    (context: AssistContext) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, context, updatedAt: now() } : c
        )
      )
    },
    [activeId]
  )

  const sendMessage = React.useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      const userMsg: AssistMessage = {
        id: createId("msg"),
        role: "user",
        content: trimmed,
        createdAt: now(),
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c
          const isFirst = c.messages.length === 0
          return {
            ...c,
            title: isFirst ? titleFromMessage(trimmed) : c.title,
            messages: [...c.messages, userMsg],
            updatedAt: now(),
          }
        })
      )

      setIsThinking(true)
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400))

      const assistantMsg: AssistMessage = {
        id: createId("msg"),
        role: "assistant",
        content: generateAssistReply(trimmed),
        createdAt: now(),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...c.messages, assistantMsg],
                updatedAt: now(),
              }
            : c
        )
      )
      setIsThinking(false)
    },
    [activeId]
  )

  const value = React.useMemo(
    () => ({
      conversations,
      activeId,
      active,
      welcomeDismissed,
      dismissWelcome,
      newConversation,
      selectConversation,
      renameConversation,
      deleteConversation,
      setContext,
      sendMessage,
      isThinking,
    }),
    [
      conversations,
      activeId,
      active,
      welcomeDismissed,
      dismissWelcome,
      newConversation,
      selectConversation,
      renameConversation,
      deleteConversation,
      setContext,
      sendMessage,
      isThinking,
    ]
  )

  return <AssistCtx.Provider value={value}>{children}</AssistCtx.Provider>
}

export function useAssistStore() {
  const ctx = React.useContext(AssistCtx)
  if (!ctx) {
    throw new Error("useAssistStore must be used within AssistStoreProvider")
  }
  return ctx
}
