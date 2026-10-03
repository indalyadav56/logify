"use client"

import Link from "next/link"
import { Check, ChevronsUpDown, Folder, LogOut, Plus, ScrollText } from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { useProjectStore } from "@/lib/project-store"
import { LogifyLogo } from "@/components/marketing/logo"
import { CreateProjectDialog } from "@/components/project/create-project-dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppBar() {
  const { user, logout } = useAuth()
  const { projects, project, status, setProject, createOpen, setCreateOpen } = useProjectStore()
  const { setOpenMobile } = useSidebar()
  const initials = (user?.full_name ?? "Your account")
    .split(" ")
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="gap-6 px-4 pb-4 pt-6">
          <Link href="/dashboard/logs" aria-label="Logify home" className="w-fit" onClick={() => setOpenMobile(false)}>
            <LogifyLogo />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 w-full justify-start gap-2 rounded-md bg-white px-3 shadow-none" aria-label="Select project">
                <Folder className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-left">{project?.name ?? (status === "loading" ? "Loading…" : "Select a project")}</span>
                <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-lg">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Your projects</DropdownMenuLabel>
              {projects.map(item => (
                <DropdownMenuItem key={item.id} onClick={() => setProject(item)} className="gap-2 rounded-md">
                  <Folder className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.id === project?.id && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setOpenMobile(false); setCreateOpen(true) }} className="rounded-md">
                <Plus className="size-4" />Create project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="px-3">
            <SidebarGroupLabel className="px-3 text-xs font-normal text-muted-foreground">Workspace</SidebarGroupLabel>
            <nav aria-label="Main navigation">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive className="h-10 gap-3 rounded-md px-3 font-medium">
                    <Link href="/dashboard/logs" onClick={() => setOpenMobile(false)}>
                      <ScrollText className="size-4" />
                      <span>Logs</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </nav>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto w-full justify-start gap-3 rounded-md px-2 py-2 shadow-none" aria-label="Account menu">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-muted text-xs font-medium">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">{user?.full_name ?? "Your account"}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
                </div>
                <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 rounded-lg">
              <DropdownMenuLabel className="font-normal text-muted-foreground">Your account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}><LogOut className="size-4" />Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
