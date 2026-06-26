"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  PanelLeftIcon,
  PlusIcon,
  ScrollTextIcon,
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

const SECTIONS: NavSection[] = [
  {
    items: [
      {
        href: "/dashboard/logs",
        icon: ScrollTextIcon,
        label: "Logs",
      },
    ],
  },
]

const STORAGE_KEY = "logify:appbar-expanded"

export function AppBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { projects, project, status, setProject, createOpen, setCreateOpen } =
    useProjectStore()
  const [expanded, setExpanded] = React.useState(true)

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === "false") setExpanded(false)
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
        "flex h-svh shrink-0 flex-col gap-1.5 bg-transparent py-3",
        "transition-[width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
        expanded ? "w-[224px]" : "w-[52px]"
      )}
    >
      <BrandHeader expanded={expanded} onToggle={toggle} />

      <ProjectSwitcher
        expanded={expanded}
        project={project}
        projects={projects}
        status={status}
        onPick={setProject}
        onRequestCreate={() => setCreateOpen(true)}
      />

      <nav
        aria-label="Primary navigation"
        className="mt-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-1.5"
      >
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
        <UserTrigger expanded={expanded} />
      </div>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
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
        expanded ? "mx-2 h-px bg-border/70" : "mx-auto h-px w-7 bg-border/70"
      )}
    />
  )
}

function BrandHeader({
  expanded,
  onToggle,
}: {
  expanded: boolean
  onToggle: () => void
}) {
  const toggleButton = (
    <button
      type="button"
      onClick={onToggle}
      aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
      title={expanded ? "Collapse" : "Expand"}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        expanded ? "size-7" : "size-9"
      )}
    >
      <PanelLeftIcon className="size-4" />
    </button>
  )

  // Collapsed rail: drop the brand mark, keep only the toggle at the top.
  if (!expanded) {
    return <div className="flex justify-center">{toggleButton}</div>
  }

  return (
    <div className="mx-1.5 flex h-11 items-center gap-1 pr-0.5 pl-1.5">
      <Link
        href="/dashboard/logs"
        aria-label="Logify"
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg transition-colors"
      >
        <LogifyMark className="size-7 shrink-0" />
        <span className="truncate text-[14px] font-semibold tracking-tight text-sidebar-foreground">
          Logify
        </span>
      </Link>
      {toggleButton}
    </div>
  )
}

function ProjectTile({
  initials,
  id,
  className,
}: {
  initials: string
  id: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
        tileStyle(id),
        className
      )}
    >
      {initials}
    </span>
  )
}

function ProjectSwitcher({
  expanded,
  project,
  projects,
  status,
  onPick,
  onRequestCreate,
}: {
  expanded: boolean
  project: ProjectSummary | null
  projects: ProjectSummary[]
  status: "loading" | "ready" | "error"
  onPick: (p: ProjectSummary) => void
  onRequestCreate: () => void
}) {
  const isLoading = status === "loading"
  const isEmpty = !isLoading && projects.length === 0

  const label = isLoading
    ? "Loading…"
    : project?.name ?? (isEmpty ? "Create a project" : "Select a project")

  const trigger = (
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        aria-label="Switch project"
        className={cn(
          "group/ws flex items-center rounded-lg border border-border/70 bg-background transition-colors hover:bg-sidebar-accent/70 data-[state=open]:bg-sidebar-accent/70",
          expanded
            ? "mx-1.5 h-9 gap-2.5 px-1.5"
            : "mx-auto size-9 justify-center border-transparent"
        )}
      >
        {project ? (
          <ProjectTile initials={project.initials} id={project.id} />
        ) : (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
            <PlusIcon className="size-4" />
          </span>
        )}
        {expanded ? (
          <>
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-left text-[13px] font-medium",
                project ? "text-sidebar-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground/70 transition-colors group-hover/ws:text-muted-foreground" />
          </>
        ) : null}
      </button>
    </DropdownMenuTrigger>
  )

  return (
    <DropdownMenu>
      {expanded ? (
        trigger
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      )}
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-64 rounded-xl p-1.5"
      >
        {isLoading ? (
          <p className="px-2 py-2 text-[12.5px] text-muted-foreground">
            Loading projects…
          </p>
        ) : isEmpty ? (
          <p className="px-2 py-2 text-[12.5px] text-muted-foreground">
            No projects yet. Create one to get started.
          </p>
        ) : null}
        {projects.map((p) => {
          const current = p.id === project?.id
          return (
            <DropdownMenuItem
              key={p.id}
              onClick={() => onPick(p)}
              className="gap-2.5 rounded-lg px-2 py-2"
            >
              <ProjectTile initials={p.initials} id={p.id} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                {p.name}
              </span>
              {current ? (
                <CheckIcon className="size-4 shrink-0 text-primary" />
              ) : null}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator className="mx-1 my-1.5" />
        <DropdownMenuItem
          className="gap-2.5 rounded-lg px-2 py-2 text-primary focus:text-primary"
          onSelect={() => onRequestCreate()}
        >
          <span className="flex size-7 shrink-0 items-center justify-center">
            <PlusIcon className="size-4" />
          </span>
          <span className="text-[13px] font-medium">Create project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const TILE_STYLES = [
  "bg-emerald-500 text-white",
  "bg-violet-500 text-white",
  "bg-sky-500 text-white",
  "bg-amber-500 text-white",
  "bg-rose-500 text-white",
]

/** Deterministic solid accent tile per project id, stable across renders. */
function tileStyle(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.codePointAt(i)!) >>> 0
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
        expanded ? "h-9 gap-2.5 px-1.5" : "size-9 justify-center self-center",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center",
          expanded && "size-7"
        )}
      >
        <Icon className="size-4" />
      </span>
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
            expanded ? "h-10 gap-2.5 px-1.5" : "mx-auto size-9 justify-center"
          )}
        >
          <Avatar className="size-7 rounded-md ring-1 ring-sidebar-border">
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

