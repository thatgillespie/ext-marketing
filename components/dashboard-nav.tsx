"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  Clock,
  Calendar,
  FileText,
  Receipt,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Time Tracking", href: "/dashboard/time-tracking", icon: Clock },
  { name: "Companies", href: "/dashboard/companies", icon: Building2 },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Proposals", href: "/dashboard/proposals", icon: FileText },
  { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            A
          </div>
          <span className="text-lg">Agency MS</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
