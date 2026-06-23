"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckIcon,
  FolderIcon,
  PlusIcon,
  ScrollTextIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { type ProjectSummary } from "@/lib/project"
import { useAuth } from "@/lib/auth-store"
import { useProjectStore } from "@/lib/project-store"
import { LogifyMark } from "@/components/marketing/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { CreateProjectDialog } from "@/components/project/create-project-dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/** Deterministic soft-gradient orb per project, stable across renders. */
const ORB_GRADIENTS = [
  "radial-gradient(circle at 30% 30%, #93c5fd, #2563eb 82%)",
  "radial-gradient(circle at 30% 30%, #c4b5fd, #7c3aed 82%)",
  "radial-gradient(circle at 30% 30%, #5eead4, #0d9488 82%)",
  "radial-gradient(circle at 30% 30%, #fdba74, #ea580c 82%)",
  "radial-gradient(circle at 30% 30%, #f9a8d4, #db2777 82%)",
  "radial-gradient(circle at 30% 30%, #86efac, #16a34a 82%)",
]

function orbFor(key: string) {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return ORB_GRADIENTS[hash % ORB_GRADIENTS.length]
}

function userInitials(fullName?: string) {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? []
  if (parts.length === 0) return "LG"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function firstName(fullName?: string) {
  const part = fullName?.trim().split(/\s+/)[0]
  return part || "there"
}

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, project, status, setProject } = useProjectStore()
  const { user } = useAuth()
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.includes(q)
    )
  }, [projects, search])

  const open = React.useCallback(
    (p: ProjectSummary) => {
      setProject(p)
      router.push(`/${p.slug}/logs`)
    },
    [router, setProject]
  )

  const activeProject = project ?? projects[0] ?? null

  return (
    <div className="flex h-svh w-full overflow-hidden bg-muted/30">
      <AccountSidebar
        projects={projects}
        activeId={project?.id}
        onOpen={open}
        onCreate={() => setCreateOpen(true)}
      />

      <main className="min-w-0 flex-1 overflow-y-auto">
        {/* mobile top bar (sidebar is desktop-only) */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border/70 px-5 md:hidden">
          <LogifyMark className="size-7" />
          <span className="text-[15px] font-semibold tracking-tight">Logify</span>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <AccountMenu compact />
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10">
          {/* greeting */}
          <header>
            <h1 className="text-[26px] font-semibold tracking-tight">
              Welcome back, {firstName(user?.full_name)}
            </h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Pick a project to open its logs, or spin up a new one.
            </p>
          </header>

          {/* get started */}
          <section className="mt-8">
            <h2 className="text-[13px] font-semibold tracking-tight text-muted-foreground">
              Get started
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <GetStartedCard
                icon={ScrollTextIcon}
                title="Open logs"
                description="Jump straight into your most recent project's live log stream."
                action={
                  activeProject
                    ? { label: "View logs", onClick: () => open(activeProject) }
                    : undefined
                }
              />
              <GetStartedCard
                icon={PlusIcon}
                title="Create project"
                description="Isolate data, members, and billing in a fresh project."
                action={{
                  label: "New project",
                  onClick: () => setCreateOpen(true),
                }}
              />
              <GetStartedCard
                icon={BookOpenIcon}
                title="Read the docs"
                description="Learn how to ship logs to Logify with the SDK or HTTP API."
                action={{ label: "Open docs", href: "https://docs.logify.dev", external: true }}
              />
            </div>
          </section>

          {/* projects */}
          <section className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[15px] font-semibold tracking-tight">
                Your projects
              </h2>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  className="h-9 w-full pl-9 sm:w-60"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {status === "loading"
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[132px] animate-pulse rounded-xl border border-border/70 bg-muted/40"
                    />
                  ))
                : filtered.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => open(p)}
                      className="group flex flex-col rounded-xl border border-border/70 bg-card p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-border hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="size-9 shrink-0 rounded-full shadow-inner ring-1 ring-black/5"
                          style={{ background: orbFor(p.slug) }}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-semibold tracking-tight">
                            {p.name}
                          </div>
                          <div className="truncate text-[12px] text-muted-foreground">
                            {p.role}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                        <span className="font-mono text-[11.5px] text-muted-foreground">
                          /{p.slug}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                          Open <ArrowRightIcon className="size-3.5" />
                        </span>
                      </div>
                    </button>
                  ))}

              {status !== "loading" ? (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="flex min-h-[132px] flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-border bg-transparent text-muted-foreground transition-colors duration-150 hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-primary">
                    <PlusIcon className="size-5" />
                  </span>
                  <span className="text-[13.5px] font-semibold">Create project</span>
                </button>
              ) : null}
            </div>

            {status !== "loading" && filtered.length === 0 ? (
              <p className="mt-10 text-center text-[13.5px] text-muted-foreground">
                No projects match “{search}”.
              </p>
            ) : null}
          </section>
        </div>
      </main>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

/** Persistent left rail: brand · project switcher list · nav · account. */
function AccountSidebar({
  projects,
  activeId,
  onOpen,
  onCreate,
}: {
  projects: ProjectSummary[]
  activeId?: string
  onOpen: (p: ProjectSummary) => void
  onCreate: () => void
}) {
  return (
    <aside className="hidden h-svh w-[248px] shrink-0 flex-col border-r border-border/70 bg-background md:flex">
      {/* brand */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <LogifyMark className="size-7" />
        <span className="text-[15px] font-semibold tracking-tight">Logify</span>
      </div>

      {/* project switcher */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2.5 pb-2">
        <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Projects
          </span>
          <button
            type="button"
            onClick={onCreate}
            aria-label="Create project"
            className="flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PlusIcon className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-0.5">
          {projects.map((p) => {
            const active = p.id === activeId
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpen(p)}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-foreground/80 hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <span
                  aria-hidden
                  className="size-6 shrink-0 rounded-full shadow-inner ring-1 ring-black/5"
                  style={{ background: orbFor(p.slug) }}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  {p.name}
                </span>
                {active ? (
                  <CheckIcon className="size-4 shrink-0 text-primary" />
                ) : null}
              </button>
            )
          })}

          <button
            type="button"
            onClick={onCreate}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-border">
              <PlusIcon className="size-3.5" />
            </span>
            New project
          </button>
        </div>

        <div className="my-2.5 h-px bg-border/70" />

        <nav className="flex flex-col gap-0.5">
          <SidebarNavLink icon={FolderIcon} label="Projects" active />
          <SidebarNavLink icon={SettingsIcon} label="Settings" href="/dashboard/settings" />
        </nav>
      </div>

      {/* account */}
      <div className="border-t border-border/70 p-2.5">
        <div className="flex items-center gap-1">
          <AccountMenu />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}

function SidebarNavLink({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  active?: boolean
}) {
  const className = cn(
    "flex h-9 items-center gap-2.5 rounded-lg px-2 text-[13px] font-medium transition-colors",
    active
      ? "bg-accent text-foreground"
      : "text-foreground/75 hover:bg-accent/60 hover:text-foreground"
  )
  const content = (
    <>
      <Icon className="size-4 shrink-0" />
      {label}
    </>
  )
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }
  return (
    <span aria-current={active ? "page" : undefined} className={className}>
      {content}
    </span>
  )
}

function GetStartedCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
    external?: boolean
  }
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border/70 bg-card p-4">
      <span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-foreground">
        <Icon className="size-[18px]" />
      </span>
      <h3 className="mt-3 text-[14px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 flex-1 text-[12.5px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? (
        action.href ? (
          <a
            href={action.href}
            {...(action.external
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline"
          >
            {action.label}
            <ArrowUpRightIcon className="size-3.5" />
          </a>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline"
          >
            {action.label}
            <ArrowRightIcon className="size-3.5" />
          </button>
        )
      ) : null}
    </div>
  )
}

function AccountMenu({ compact }: { compact?: boolean }) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const name = user?.full_name?.trim() || "Your account"
  const email = user?.email ?? ""

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
              "flex items-center gap-2 rounded-lg text-left transition-colors hover:bg-accent",
              compact ? "p-1" : "min-w-0 flex-1 px-1.5 py-1.5"
            )}
          >
            <Avatar className="size-8 ring-1 ring-border">
              <AvatarFallback className="bg-foreground text-[11px] font-semibold text-background">
                {userInitials(user?.full_name)}
              </AvatarFallback>
            </Avatar>
            {compact ? null : (
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[13px] font-medium">{name}</span>
                {email ? (
                  <span className="truncate text-[11px] text-muted-foreground">
                    {email}
                  </span>
                ) : null}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-52">
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
              again to access your projects.
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
