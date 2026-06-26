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

type JwtClaims = { sub?: string; exp?: number; [k: string]: unknown }

/** Decode a JWT payload without verifying the signature (client display only). */
function decodeJwt(token: string): JwtClaims {
  try {
    const payload = token.split(".")[1]
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(decodeURIComponent(escape(json))) as JwtClaims
  } catch {
    return {}
  }
}

/** True when the JWT carries an `exp` claim that is already in the past. */
function isTokenExpired(token: string): boolean {
  const { exp } = decodeJwt(token)
  if (typeof exp !== "number") return false
  return exp * 1000 <= Date.now()
}

/** Prettify an email local-part into a display name (e.g. "ada.lovelace" → "Ada Lovelace"). */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? ""
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ") || email
  )
}

/**
 * Build a session from the API token response. The backend returns only tokens,
 * so the user is derived from the JWT `sub` plus the values typed at sign-in.
 */
function toSession(data: TokenData, fallback?: Partial<AuthUser>): AuthSession {
  const claims = decodeJwt(data.access_token)
  const email = data.user?.email ?? fallback?.email ?? ""
  const user: AuthUser = data.user ?? {
    id: String(claims.sub ?? ""),
    email,
    full_name: fallback?.full_name?.trim() || (email ? nameFromEmail(email) : "Your account"),
    role: fallback?.role ?? "member",
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type || "Bearer",
    user,
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

  const logout = React.useCallback(() => {
    persistSession(null)
    setSession(null)
    setStatus("unauthenticated")
  }, [])

  // Hydrate from localStorage once on mount. Drop sessions whose token has
  // already expired so a stale token doesn't keep the user "signed in".
  React.useEffect(() => {
    const existing = readSession()
    if (existing && isTokenExpired(existing.accessToken)) {
      persistSession(null)
      setSession(null)
      setStatus("unauthenticated")
      return
    }
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

  // Any authenticated API call that returns 401 signs the user out so the
  // route guard can redirect them to /login (handles invalid/expired tokens).
  React.useEffect(() => {
    const onUnauthorized = () => logout()
    window.addEventListener("logify:unauthorized", onUnauthorized)
    return () => window.removeEventListener("logify:unauthorized", onUnauthorized)
  }, [logout])

  const applySession = React.useCallback(
    (data: TokenData, fallback?: Partial<AuthUser>) => {
      const next = toSession(data, fallback)
      persistSession(next)
      setSession(next)
      setStatus("authenticated")
    },
    []
  )

  const login = React.useCallback(
    async (email: string, password: string) => {
      const data = await loginUser({ email, password })
      applySession(data, { email })
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
      applySession(data, { full_name: fullName, email })
    },
    [applySession]
  )

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
