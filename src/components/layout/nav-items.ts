import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
]

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: NAV_ITEMS.filter((i) => i.href === "/dashboard"),
  },
  {
    label: "Operations",
    items: NAV_ITEMS.filter((i) => ["/events"].includes(i.href)),
  },
  {
    label: "CRM",
    items: NAV_ITEMS.filter((i) => i.href === "/customers"),
  },
  {
    label: "Admin",
    items: NAV_ITEMS.filter((i) => i.adminOnly),
  },
]
