"use client"

import { useSession } from "next-auth/react"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DashboardHeader() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6">
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-8"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600"></span>
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
            <p className="text-xs text-gray-500">
              {(session?.user as any)?.role || "Employee"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
        </div>
      </div>
    </header>
  )
}
