import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  CreditCard,
  ActivitySquare,
  ScrollText,
  Settings,
  Logs,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const nav = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/system", label: "System health", icon: ActivitySquare },
    ],
  },
  {
    label: "Manage",
    items: [
      { to: "/organizations", label: "Organizations", icon: Building2 },
      { to: "/users", label: "Users", icon: Users },
      { to: "/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/billing", label: "Billing", icon: CreditCard },
      { to: "/audit-logs", label: "Audit logs", icon: ScrollText },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
]

function isItemActive(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(to + "/")
}

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Logs className="size-4" />
          </div>
          <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Logify</span>
            <span className="text-[11px] text-muted-foreground">
              Admin Console
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {nav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isItemActive(pathname, item.to, item.end)
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                      >
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent">
          <Avatar className="size-8">
            <AvatarFallback>IY</AvatarFallback>
          </Avatar>
          <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium">Indal Yadav</span>
            <span className="text-[11px] text-muted-foreground">
              Platform admin
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
