"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CommandIcon,
  Grid3x3Icon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  ScrollTextIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { DEFAULT_WORKSPACES, type WorkspaceSummary } from "@/lib/workspace"
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog"
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
import { ThemeToggle } from "@/components/theme-toggle"

type NavItem = {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: { kind: "live" | "count"; value: string }
  exact?: boolean
}

type NavSection = {
  label: string
  items: NavItem[]
}

const SECTIONS: NavSection[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/dashboard",
        icon: LayoutDashboardIcon,
        label: "Dashboard",
        exact: true,
      },
    ],
  },
  {
    label: "Observe",
    items: [
      {
        href: "/dashboard/ai-insights",
        icon: SparklesIcon,
        label: "AI insights",
      },
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
  const [workspaces, setWorkspaces] =
    React.useState<WorkspaceSummary[]>(DEFAULT_WORKSPACES)
  const [workspace, setWorkspace] = React.useState<WorkspaceSummary>(
    DEFAULT_WORKSPACES[0]
  )
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = React.useState(false)
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

  return (
    <aside
      data-slot="app-bar"
      data-state={expanded ? "expanded" : "collapsed"}
      className={cn(
        "flex h-svh shrink-0 flex-col gap-1 border-r bg-sidebar/70 py-2",
        "transition-[width] duration-200 ease-out",
        expanded ? "w-[224px]" : "w-[52px]"
      )}
    >
      <WorkspaceTrigger
        expanded={expanded}
        workspace={workspace}
        workspaces={workspaces}
        onPick={setWorkspace}
        onRequestCreate={() => setCreateWorkspaceOpen(true)}
      />

      <SectionDivider expanded={expanded} />

      <QuickAction
        expanded={expanded}
        pathname={pathname}
        icon={SearchIcon}
        label="Search"
        kbd={
          <span className="ml-auto inline-flex items-center gap-0.5">
            <Kbd>
              <CommandIcon className="size-2.5" />K
            </Kbd>
          </span>
        }
        tooltip={
          <span className="flex items-center gap-2">
            Search
            <Kbd>
              <CommandIcon className="size-2.5" />K
            </Kbd>
          </span>
        }
      />
      <QuickAction
        expanded={expanded}
        pathname={pathname}
        href="/dashboard/ai-insights"
        icon={SparklesIcon}
        label="AI insights"
        dot="bg-violet-500"
        tooltip="AI insights"
      />
      <QuickAction
        expanded={expanded}
        pathname={pathname}
        icon={Grid3x3Icon}
        label="Apps"
        tooltip="Apps"
      />

      <nav
        aria-label="Primary navigation"
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain"
      >
        {SECTIONS.map((section, idx) => (
          <React.Fragment key={section.label}>
            {idx === 0 ? (
              <SectionDivider expanded={expanded} />
            ) : (
              <SectionDivider expanded={expanded} dense />
            )}
            {expanded ? (
              <div className="text-eyebrow px-3 pt-2 pb-1.5">
                {section.label}
              </div>
            ) : null}
            <div className="flex flex-col items-stretch gap-0.5 px-1.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  expanded={expanded}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
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
            <span className="ml-2 text-[13px] font-medium text-muted-foreground">
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
          "mx-1.5 mt-1 flex h-8 items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
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

      <CreateWorkspaceDialog
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
        takenIds={workspaces.map((w) => w.id)}
        onCreated={(w) => {
          setWorkspaces((prev) => [...prev, w])
          setWorkspace(w)
        }}
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

function WorkspaceTrigger({
  expanded,
  workspace,
  workspaces,
  onPick,
  onRequestCreate,
}: {
  expanded: boolean
  workspace: WorkspaceSummary
  workspaces: WorkspaceSummary[]
  onPick: (w: WorkspaceSummary) => void
  onRequestCreate: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group/ws flex items-center rounded-md transition-colors",
            expanded
              ? "mx-1.5 h-9 gap-2 px-1.5 hover:bg-muted/60"
              : "mx-auto size-9 justify-center"
          )}
          aria-label="Workspace"
        >
          <Logomark className={cn(expanded ? "size-8" : "size-9")} />
          {expanded ? (
            <span className="flex min-w-0 flex-col items-start leading-tight">
              <span className="truncate text-[13px] font-semibold text-foreground">
                {workspace.name}
              </span>
              <span className="truncate text-[11.5px] font-medium text-muted-foreground">
                {workspace.role}
              </span>
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-60">
        <DropdownMenuLabel className="text-[11px]">
          Workspace
        </DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onClick={() => onPick(w)}
            className="gap-2"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-muted text-[10px] font-semibold">
              {w.initials}
            </span>
            <span className="flex flex-col">
              <span className="text-sm">{w.name}</span>
              <span className="text-[10.5px] text-muted-foreground">
                {w.role}
              </span>
            </span>
            {w.id === workspace.id ? (
              <span className="ml-auto text-[10px] text-muted-foreground">
                current
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 font-medium"
          onSelect={() => onRequestCreate()}
        >
          <PlusCircleIcon className="size-4 text-muted-foreground" />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
    "relative flex items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    active && "bg-primary/10 text-foreground",
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
  const active = isActive(pathname, item.href, item.exact)
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
        "group/nav relative flex items-center rounded-md transition-colors",
        expanded ? "h-9 gap-2.5 px-2" : "size-9 justify-center self-center",
        active
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {expanded ? (
        <span className="truncate text-[13px] font-medium">
          {item.label}
        </span>
      ) : null}
      {badgeNode}
      {active ? (
        <span
          aria-hidden
          className={cn(
            "absolute h-5 w-1 rounded-r-full bg-primary",
            expanded ? "-left-1.5 top-2" : "-left-2 top-2"
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
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-rose-500/20 text-rose-300"
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account"
          className={cn(
            "flex items-center rounded-md transition-colors hover:bg-muted",
            expanded ? "h-9 gap-2 px-1.5" : "mx-auto size-9 justify-center"
          )}
        >
          <Avatar className="size-8 rounded-md">
            <AvatarFallback className="rounded-md bg-emerald-600 text-[11.5px] font-semibold text-white">
              AM
            </AvatarFallback>
          </Avatar>
          {expanded ? (
            <span className="flex min-w-0 flex-col items-start leading-tight">
              <span className="truncate text-[13px] font-semibold">
                Avery Moore
              </span>
              <span className="truncate text-[11.5px] text-muted-foreground">
                avery@logify.io
              </span>
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-52">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm">Avery Moore</span>
          <span className="text-[10.5px] text-muted-foreground">
            avery@logify.io
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Account settings</DropdownMenuItem>
        <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
        <DropdownMenuItem>Switch organization</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (href === "/" || exact) return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

function Logomark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-foreground text-background shadow-sm",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[55%]"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 4v15a1 1 0 0 0 1 1h13" />
        <path d="M5 4l3 6 4-3 4 5 3-3" />
      </svg>
    </span>
  )
}
