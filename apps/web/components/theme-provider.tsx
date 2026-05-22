"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
}

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
  themes: Theme[]
  systemTheme?: "light" | "dark"
}

const ThemeCtx = React.createContext<ThemeContextValue | null>(null)

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return theme
}

function applyThemeClass(resolved: "light" | "dark") {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableSystem = true,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(
    defaultTheme === "light" ? "light" : "dark"
  )

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
        setThemeState(stored)
      }
    } catch {
      /* localStorage may be unavailable */
    }
  }, [storageKey])

  React.useEffect(() => {
    const resolved = resolveTheme(theme)
    applyThemeClass(resolved)
    setResolvedTheme(resolved)

    if (theme !== "system" || !enableSystem) return

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const next = mq.matches ? "dark" : "light"
      applyThemeClass(next)
      setResolvedTheme(next)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [theme, enableSystem])

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next)
      try {
        localStorage.setItem(storageKey, next)
      } catch {
        /* localStorage may be unavailable */
      }
    },
    [storageKey]
  )

  const themes: Theme[] = enableSystem
    ? ["light", "dark", "system"]
    : ["light", "dark"]

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      themes,
      systemTheme: resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme, themes]
  )

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx)
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return ctx
}
