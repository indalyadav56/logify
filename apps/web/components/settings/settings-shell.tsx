"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2Icon,
  ChevronRightIcon,
  KeyRoundIcon,
  ShieldIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const NAV = [
  {
    href: "/dashboard/settings",
    label: "General",
    icon: Building2Icon,
    exact: true,
  },
  {
    href: "/dashboard/settings/account",
    label: "Account",
    icon: UserCogIcon,
  },
  {
    href: "/dashboard/settings/users",
    label: "Members",
    icon: UsersIcon,
  },
  {
    href: "/dashboard/settings/api-keys",
    label: "API keys",
    icon: KeyRoundIcon,
  },
  {
    href: "/dashboard/settings/roles",
    label: "Roles & permissions",
    icon: ShieldIcon,
  },
] as const

export function SettingsShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  const pathname = usePathname()

  const activeHref =
    NAV.find((item) =>
      "exact" in item && item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    )?.href ?? NAV[0].href

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <div className="flex w-full shrink-0 flex-col border-b border-border/80 bg-background/90 backdrop-blur-md md:hidden">
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Settings
          </p>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-3">
          {NAV.map((item) => {
            const active = item.href === activeHref
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-border/80 bg-sidebar md:flex">
        <div className="border-b border-border/60 px-4 py-4">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Settings
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Settings">
          {NAV.map((item) => {
            const Icon = item.icon
            const active =
              "exact" in item && item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {active ? (
                  <ChevronRightIcon className="ml-auto size-3.5 opacity-60" />
                ) : null}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-border/80 bg-background/90 px-4 py-4 backdrop-blur-md sm:px-6">
          <h1 className="text-[17px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
