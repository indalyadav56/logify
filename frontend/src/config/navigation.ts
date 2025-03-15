import {
  BarChart,
  Bell,
  Bookmark,
  GalleryVerticalEnd,
  LayoutDashboard,
  Logs,
  Settings2,
  Download,
  Webhook,
  Users,
  ScrollText,
  Upload,
  CreditCard,
  BookOpen,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Logs",
    icon: Logs,
    href: "/logs",
  },
  {
    title: "Projects",
    icon: GalleryVerticalEnd,
    href: "/projects",
  },
  {
    title: "Alerts",
    icon: Bell,
    href: "/alerts",
  },
  {
    title: "Billing",
    icon: CreditCard,
    href: "/billing",
  },
  {
    title: "Documentation",
    icon: BookOpen,
    href: "/docs",
  },
  {
    title: "Analytics",
    icon: BarChart,
    href: "/analytics",
  },
  {
    title: "Import",
    icon: Upload,
    href: "/import",
  },
  {
    title: "Export",
    icon: Download,
    href: "/export",
  },
  {
    title: "Bookmarks",
    icon: Bookmark,
    href: "/bookmarks",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    title: "Webhooks",
    icon: Webhook,
    href: "/webhooks",
  },
  {
    title: "Teams & Members",
    icon: Users,
    href: "/teams",
  },
  {
    title: "Audit Logs",
    icon: ScrollText,
    href: "/audit",
  },
  {
    title: "Settings",
    icon: Settings2,
    href: "/settings",
  },
];
