"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BellIcon,
  BookOpenIcon,
  CommandIcon,
  PlusCircleIcon,
  SearchIcon,
} from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/ai-insights": "AI insights",
  "/dashboard/logs": "Logs",
}

const ENVIRONMENTS = [
  { id: "production", label: "Production", color: "bg-emerald-500" },
  { id: "staging", label: "Staging", color: "bg-amber-500" },
  { id: "development", label: "Development", color: "bg-sky-500" },
]

export function AppHeader() {
  const pathname = usePathname()
  const title = TITLES[pathname] ?? toTitle(pathname)
  const [env, setEnv] = React.useState(ENVIRONMENTS[0])
  const hasFacets = pathname.startsWith("/dashboard/logs")

  return (
    <header className="sticky top-0 z-30 flex h-[52px] shrink-0 items-center gap-2 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md">
      {hasFacets ? (
        <>
          <SidebarTrigger className="-ml-1 size-8" />
          <Separator
            orientation="vertical"
            className="mx-0.5 h-4 bg-border/60"
          />
        </>
      ) : null}

      <Link
        href="/"
        className="hidden items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
      >
        Logify
      </Link>
      <span className="hidden text-muted-foreground/40 md:inline">/</span>
      <span className="text-[13.5px] font-semibold tracking-tight">
        {title}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="ml-1.5 h-7 gap-1.5 px-2 text-[12px] font-medium text-muted-foreground hover:text-foreground"
          >
            <span className={`size-1.5 rounded-full ${env.color}`} />
            <span>env: {env.id}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel className="text-[11px]">
            Environment
          </DropdownMenuLabel>
          {ENVIRONMENTS.map((e) => (
            <DropdownMenuItem
              key={e.id}
              onClick={() => setEnv(e)}
              className="gap-2"
            >
              <span className={`size-1.5 rounded-full ${e.color}`} />
              <span>{e.label}</span>
              {e.id === env.id ? (
                <span className="ml-auto text-[10px] text-muted-foreground">
                  current
                </span>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Docs">
              <BookOpenIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Docs</TooltipContent>
        </Tooltip>

        <Separator
          orientation="vertical"
          className="mx-1 h-4 bg-border/60"
        />

        <Button
          size="sm"
          variant="default"
          className="h-8 gap-1.5 px-3 text-[12.5px] font-medium"
        >
          <PlusCircleIcon /> New
        </Button>
      </div>
    </header>
  )
}

function toTitle(path: string) {
  const seg = path.split("/").findLast(Boolean) ?? ""
  return seg.charAt(0).toUpperCase() + seg.slice(1)
}
