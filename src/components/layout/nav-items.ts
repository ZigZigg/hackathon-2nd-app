import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Clock,
  ClipboardList,
  Users,
  DollarSign,
  UserCircle,
  Package,
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
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/schedule", label: "Schedule", icon: Clock },
  { href: "/timesheets", label: "Timesheets", icon: ClipboardList },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/cash-flow", label: "Cash Flow", icon: DollarSign },
  { href: "/hr", label: "HR Management", icon: UserCircle },
  { href: "/inventory", label: "Props", icon: Package },
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
    items: NAV_ITEMS.filter((i) =>
      ["/events", "/tasks", "/schedule", "/timesheets"].includes(i.href)
    ),
  },
  {
    label: "CRM",
    items: NAV_ITEMS.filter((i) => i.href === "/customers"),
  },
  {
    label: "Finance",
    items: NAV_ITEMS.filter((i) => i.href === "/cash-flow"),
  },
  {
    label: "HR",
    items: NAV_ITEMS.filter((i) => i.href === "/hr"),
  },
  {
    label: "Inventory",
    items: NAV_ITEMS.filter((i) => i.href === "/inventory"),
  },
  {
    label: "Admin",
    items: NAV_ITEMS.filter((i) => i.adminOnly),
  },
]
