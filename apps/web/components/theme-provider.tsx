"use client"

import { createContext, useContext, useEffect } from "react"
import type { ReactNode } from "react"

type Theme = "light" | "dark" | "system"
const ThemeCtx = createContext<{ theme: Theme; resolvedTheme: "light"; themes: Theme[]; setTheme: (theme: Theme) => void }>({ theme: "light", resolvedTheme: "light", themes: ["light"], setTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark")
    document.documentElement.classList.add("light")
  }, [])
  return <ThemeCtx.Provider value={{ theme: "light", resolvedTheme: "light", themes: ["light"], setTheme: () => {} }}>{children}</ThemeCtx.Provider>
}

export function useTheme() { return useContext(ThemeCtx) }
