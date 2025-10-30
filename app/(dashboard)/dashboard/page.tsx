"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  DollarSign
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    projectCount: 0,
    activeTaskCount: 0,
    hoursThisWeek: 0,
    upcomingDeadlinesCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user) return

      try {
        // Fetch basic stats from various APIs
        const [projectsRes, timeEntriesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/time-entries')
        ])

        const projects = await projectsRes.json()
        const timeEntries = await timeEntriesRes.json()

        // Calculate stats
        const activeProjects = Array.isArray(projects)
          ? projects.filter((p: any) =>
              p.status === 'PLANNING' || p.status === 'IN_PROGRESS'
            ).length
          : 0

        // Calculate hours this week
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const thisWeekEntries = Array.isArray(timeEntries)
          ? timeEntries.filter((entry: any) =>
              new Date(entry.startTime) >= weekAgo
            )
          : []
        const totalMinutes = thisWeekEntries.reduce(
          (sum: number, entry: any) => sum + (entry.duration || 0),
          0
        )
        const hoursThisWeek = Math.round((totalMinutes / 60) * 10) / 10

        setStats({
          projectCount: activeProjects,
          activeTaskCount: 0, // Would need tasks API
          hoursThisWeek,
          upcomingDeadlinesCount: 0 // Would need tasks API with deadlines
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {session?.user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projectCount}</div>
            <p className="text-xs text-gray-500">Projects in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              My Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTaskCount}</div>
            <p className="text-xs text-gray-500">Tasks to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Hours This Week
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hoursThisWeek}h</div>
            <p className="text-xs text-gray-500">Tracked time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Upcoming Deadlines
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDeadlinesCount}</div>
            <p className="text-xs text-gray-500">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/time-tracking"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Start Timer</span>
            </Link>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <FolderKanban className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">View Projects</span>
            </Link>
            <Link
              href="/dashboard/companies"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">View Companies</span>
            </Link>
            <Link
              href="/dashboard/calendar"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">View Calendar</span>
            </Link>
            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">View Invoices</span>
            </Link>
            <Link
              href="/dashboard/proposals"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">View Proposals</span>
            </Link>
            <Link
              href="/dashboard/contacts"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">View Contacts</span>
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <FolderKanban className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">View Reports</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
