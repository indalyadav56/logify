"use client"

import * as React from "react"

import {
  loginUser,
  registerUser,
  type AuthUser,
  type TokenData,
} from "@/lib/api/auth"

const STORAGE_KEY = "logify:auth"

export type AuthSession = {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: AuthUser
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<void>
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

function toSession(data: TokenData): AuthSession {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type || "Bearer",
    user: data.user,
  }
}

function readSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.accessToken || !parsed?.user) return null
    return parsed
  } catch {
    return null
  }
}

function persistSession(session: AuthSession | null) {
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* localStorage may be unavailable */
  }
}

/**
 * Read the stored access token outside of React (e.g. to authenticate other
 * API calls). Returns `null` on the server or when signed out.
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return readSession()?.accessToken ?? null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<AuthSession | null>(null)
  const [status, setStatus] = React.useState<AuthStatus>("loading")

  // Hydrate from localStorage once on mount.
  React.useEffect(() => {
    const existing = readSession()
    setSession(existing)
    setStatus(existing ? "authenticated" : "unauthenticated")
  }, [])

  // Keep auth state in sync across tabs.
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      const next = readSession()
      setSession(next)
      setStatus(next ? "authenticated" : "unauthenticated")
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const applySession = React.useCallback((data: TokenData) => {
    const next = toSession(data)
    persistSession(next)
    setSession(next)
    setStatus("authenticated")
  }, [])

  const login = React.useCallback(
    async (email: string, password: string) => {
      const data = await loginUser({ email, password })
      applySession(data)
    },
    [applySession]
  )

  const register = React.useCallback(
    async (fullName: string, email: string, password: string) => {
      const data = await registerUser({
        full_name: fullName,
        email,
        password,
      })
      applySession(data)
    },
    [applySession]
  )

  const logout = React.useCallback(() => {
    persistSession(null)
    setSession(null)
    setStatus("unauthenticated")
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      login,
      register,
      logout,
    }),
    [status, session, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>")
  }
  return ctx
}
