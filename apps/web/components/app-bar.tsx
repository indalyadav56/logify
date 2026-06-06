"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CheckIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  LayoutDashboardIcon,
  PlusIcon,
  ScrollTextIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { ProjectSummary } from "@/lib/project"
import { useAuth } from "@/lib/auth-store"
import { useProjectStore } from "@/lib/project-store"
import { LogifyMark } from "@/components/marketing/logo"
import { CreateProjectDialog } from "@/components/project/create-project-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

type NavItem = {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: { kind: "live" | "count"; value: string }
  exact?: boolean
  kbdShortcut?: string
  /** Navigates but never shows active state (e.g. Search → logs) */
  suppressActive?: boolean
}

type NavSection = {
  items: NavItem[]
}

const UTIL_ITEMS: NavItem[] = [
  {
    href: "/dashboard/logs",
    icon: SearchIcon,
    label: "Search",
    kbdShortcut: "K",
    suppressActive: true,
  },
  {
    href: "/dashboard/assist",
    icon: SparklesIcon,
    label: "Assist",
    kbdShortcut: "I",
    exact: true,
  },
]

const SECTIONS: NavSection[] = [
  {
    items: [
      {
        href: "/dashboard/dashboards",
        icon: LayoutDashboardIcon,
        label: "Dashboards",
      },
      {
        href: "/dashboard/logs",
        icon: ScrollTextIcon,
        label: "Logs",
      },
      {
        href: "/dashboard/settings",
        icon: SettingsIcon,
        label: "Settings",
      },
    ],
  },
]

const STORAGE_KEY = "logify:appbar-expanded"

export function AppBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { projects, project, setProject } = useProjectStore()
  const [createProjectOpen, setCreateProjectOpen] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === "true") setExpanded(true)
    } catch {
      /* localStorage may be unavailable */
    }
  }, [])

  const toggle = React.useCallback(() => {
    setExpanded((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false")
      } catch {
        /* localStorage may be unavailable */
      }
      return next
    })
  }, [])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      const key = e.key.toLowerCase()
      if (key === "i") {
        e.preventDefault()
        router.push("/dashboard/assist")
      }
      if (key === "k") {
        e.preventDefault()
        router.push("/dashboard/logs")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [router])

  return (
    <aside
      data-slot="app-bar"
      data-state={expanded ? "expanded" : "collapsed"}
      className={cn(
        "flex h-svh shrink-0 flex-col gap-1 border-r border-sidebar-border bg-sidebar py-2 shadow-[1px_0_0_0_color-mix(in_oklch,var(--foreground)_4%,transparent)]",
        "transition-[width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
        expanded ? "w-[224px]" : "w-[52px]"
      )}
    >
      <ProjectTrigger
        expanded={expanded}
        project={project}
        projects={projects}
        onPick={setProject}
        onRequestCreate={() => setCreateProjectOpen(true)}
      />

      <SectionDivider expanded={expanded} />

      <nav
        aria-label="Primary navigation"
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain"
      >
        {UTIL_ITEMS.map((item) => (
          <NavLink
            key={`util-${item.label}`}
            item={item}
            pathname={pathname}
            expanded={expanded}
          />
        ))}
        <SectionDivider expanded={expanded} dense />
        {SECTIONS.map((section) =>
          section.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              expanded={expanded}
            />
          ))
        )}
      </nav>

      <SectionDivider expanded={expanded} />

      <div className="flex flex-col items-stretch gap-0.5 px-1.5">
        <div
          className={cn(
            "flex items-center",
            expanded ? "px-1.5" : "justify-center"
          )}
        >
          <ThemeToggle />
          {expanded ? (
            <span className="ml-2 text-[13px] font-medium text-muted-foreground/90">
              Theme
            </span>
          ) : null}
        </div>

        <UserTrigger expanded={expanded} />
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
        title={expanded ? "Collapse" : "Expand"}
        className={cn(
          "mx-1.5 mt-1 flex h-8 items-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          expanded ? "justify-start gap-2.5 px-2" : "justify-center"
        )}
      >
        {expanded ? (
          <ChevronsLeftIcon className="size-4" />
        ) : (
          <ChevronsRightIcon className="size-4" />
        )}
        {expanded ? (
          <span className="text-[13px] font-medium">Collapse</span>
        ) : null}
      </button>

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </aside>
  )
}

function SectionDivider({
  expanded,
  dense,
}: {
  expanded: boolean
  dense?: boolean
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "shrink-0",
        dense ? "my-0.5" : "my-1.5",
        expanded ? "mx-3 h-px bg-border" : "mx-auto h-px w-7 bg-border"
      )}
    />
  )
}

function ProjectTrigger({
  expanded,
  project,
  projects,
  onPick,
  onRequestCreate,
}: {
  expanded: boolean
  project: ProjectSummary | null
  projects: ProjectSummary[]
  onPick: (p: ProjectSummary) => void
  onRequestCreate: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group/ws flex items-center rounded-lg transition-colors",
            expanded
              ? "mx-1.5 h-11 gap-2.5 px-1.5 hover:bg-sidebar-accent/80 data-[state=open]:bg-sidebar-accent/80"
              : "mx-auto size-9 justify-center hover:bg-sidebar-accent/80 data-[state=open]:bg-sidebar-accent/80"
          )}
          aria-label="Switch project"
        >
          <LogifyMark className={cn("shrink-0", expanded ? "size-8" : "size-7")} />
          {expanded ? (
            <>
              <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                <span className="w-full truncate text-[13px] font-semibold text-sidebar-foreground">
                  {project?.name ?? "Select a project"}
                </span>
                <span className="w-full truncate text-[11.5px] font-medium text-muted-foreground">
                  {project?.role ?? "No project yet"}
                </span>
              </span>
              <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground/70 transition-colors group-hover/ws:text-muted-foreground" />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-72 rounded-xl p-1.5"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-2 pt-1.5 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          <span>Projects</span>
          <span className="font-mono text-[10.5px] tracking-normal text-muted-foreground/70">
            {projects.length}
          </span>
        </DropdownMenuLabel>
        <div className="space-y-0.5">
          {projects.length === 0 ? (
            <p className="px-2 py-2 text-[12px] text-muted-foreground">
              No projects yet. Create your first one below.
            </p>
          ) : null}
          {projects.map((p) => {
            const current = p.id === project?.id
            return (
              <DropdownMenuItem
                key={p.id}
                onClick={() => onPick(p)}
                className={cn(
                  "gap-2.5 rounded-lg px-2 py-2",
                  current && "bg-sidebar-accent/60"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ring-1 ring-inset",
                    tileStyle(p.id)
                  )}
                >
                  {p.initials}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-medium text-foreground">
                    {p.name}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {p.role}
                  </span>
                </span>
                {current ? (
                  <CheckIcon className="ml-auto size-4 shrink-0 text-primary" />
                ) : null}
              </DropdownMenuItem>
            )
          })}
        </div>
        <DropdownMenuSeparator className="mx-1 my-1.5" />
        <DropdownMenuItem
          className="gap-2.5 rounded-lg px-2 py-2 font-medium"
          onSelect={() => onRequestCreate()}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
            <PlusIcon className="size-4" />
          </span>
          <span className="text-[13px]">Create project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const TILE_STYLES = [
  "bg-sky-500/15 text-sky-600 ring-sky-500/25 dark:text-sky-300",
  "bg-violet-500/15 text-violet-600 ring-violet-500/25 dark:text-violet-300",
  "bg-amber-500/15 text-amber-600 ring-amber-500/25 dark:text-amber-300",
  "bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-300",
  "bg-rose-500/15 text-rose-600 ring-rose-500/25 dark:text-rose-300",
]

/** Deterministic accent tile per project id, stable across renders. */
function tileStyle(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return TILE_STYLES[hash % TILE_STYLES.length]
}

function QuickAction({
  expanded,
  pathname,
  href,
  icon: Icon,
  label,
  dot,
  kbd,
  tooltip,
}: {
  expanded: boolean
  pathname: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  dot?: string
  kbd?: React.ReactNode
  tooltip: React.ReactNode
}) {
  const active =
    href != null &&
    (pathname === href ||
      (href !== "/" && pathname.startsWith(`${href}/`)))

  const className = cn(
    "relative flex items-center rounded-md text-sidebar-foreground/80 transition-colors duration-150 ease-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    active && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
    expanded
      ? "mx-1.5 h-9 justify-start gap-2.5 px-2"
      : "mx-auto size-9 justify-center"
  )

  const content = (
    <>
      <Icon className="size-4 shrink-0" />
      {expanded ? (
        <span className="text-[13px] font-medium">{label}</span>
      ) : null}
      {expanded && kbd ? kbd : null}
      {dot ? (
        <span
          className={cn(
            "absolute size-1.5 rounded-full",
            dot,
            expanded ? "top-2 left-5" : "top-2 right-2"
          )}
        />
      ) : null}
    </>
  )

  const interactive =
    href == null ? (
      <button type="button" aria-label={label} className={className}>
        {content}
      </button>
    ) : (
      <Link href={href} aria-label={label} className={className}>
        {content}
      </Link>
    )

  if (expanded) return interactive

  return (
    <Tooltip>
      <TooltipTrigger asChild>{interactive}</TooltipTrigger>
      <TooltipContent side="right">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function NavLink({
  item,
  pathname,
  expanded,
}: {
  item: NavItem
  pathname: string
  expanded: boolean
}) {
  const active =
    !item.suppressActive && isActive(pathname, item.href, item.exact)
  const Icon = item.icon

  const badgeNode = item.badge ? (
    expanded ? (
      <span
        className={cn(
          "ml-auto inline-flex h-[18px] items-center rounded px-1.5 font-mono text-[10.5px] font-semibold"
        )}
      >
        {item.badge.value}
      </span>
    ) : (
      <span
        aria-hidden
        className={cn(
          "absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2 ring-sidebar"
        )}
      />
    )
  ) : null

  const link = (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative flex items-center rounded-md transition-colors duration-150 ease-out",
        expanded ? "h-9 gap-2.5 px-2" : "size-9 justify-center self-center",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {expanded ? (
        <span className="truncate text-[13px] font-medium text-sidebar-foreground">
          {item.label}
        </span>
      ) : null}
      {badgeNode}
      {expanded && item.kbdShortcut ? (
        <Kbd className="ml-auto font-mono text-[10px] opacity-70">
          ⌘{item.kbdShortcut}
        </Kbd>
      ) : null}
      {active ? (
        <span
          aria-hidden
          className={cn(
            "absolute h-5 w-0.5 rounded-full bg-sidebar-primary",
            expanded ? "-left-1 top-2" : "-left-2 top-2"
          )}
        />
      ) : null}
    </Link>
  )

  if (expanded) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className="gap-1.5">
        {item.label}
        {item.badge ? (
          <span
            className={cn(
              "inline-flex h-4 items-center rounded px-1 font-mono text-[10px]",
              item.badge.kind === "live"
                ? "bg-primary/15 text-primary"
                : "bg-destructive/15 text-destructive"
            )}
          >
            {item.badge.value}
          </span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  )
}

function UserTrigger({ expanded }: { expanded: boolean }) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const name = user?.full_name?.trim() || "Your account"
  const email = user?.email ?? ""
  const initials = userInitials(user?.full_name)

  function onSignOut() {
    logout()
    router.replace("/login")
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account"
          className={cn(
            "flex max-w-full items-center rounded-md text-sidebar-foreground transition-colors duration-150 ease-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            expanded ? "h-9 gap-2 px-1.5" : "mx-auto size-9 justify-center"
          )}
        >
          <Avatar className="size-8 rounded-md ring-1 ring-sidebar-border">
            <AvatarFallback className="rounded-md bg-sidebar-primary text-[11.5px] font-semibold text-sidebar-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {expanded ? (
            <span className="flex min-w-0 flex-col items-start leading-tight">
              <span className="truncate text-[13px] font-semibold">{name}</span>
              {email ? (
                <span className="truncate text-[11.5px] text-muted-foreground">
                  {email}
                </span>
              ) : null}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-52">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm">{name}</span>
          {email ? (
            <span className="truncate text-[10.5px] text-muted-foreground">
              {email}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/account">Account settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">Project settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => setConfirmOpen(true)}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of Logify?</AlertDialogTitle>
          <AlertDialogDescription>
            You&rsquo;ll be returned to the sign-in page and need to sign in
            again to access this project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white shadow-sm hover:bg-destructive/90 dark:text-white"
            onClick={onSignOut}
          >
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

/** Two-letter initials from a full name, falling back to "LG". */
function userInitials(fullName?: string) {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? []
  if (parts.length === 0) return "LG"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (href === "/" || exact) return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

