import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FolderKanban,
  CheckSquare,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle
} from "lucide-react"

async function getDashboardData(userId: string) {
  const [
    projectCount,
    activeTaskCount,
    timeEntriesThisWeek,
    upcomingDeadlines,
    recentActivity,
  ] = await Promise.all([
    prisma.project.count({
      where: {
        members: {
          some: {
            userId,
          },
        },
        status: {
          in: ["PLANNING", "IN_PROGRESS"],
        },
      },
    }),
    prisma.task.count({
      where: {
        assignedToId: userId,
        status: {
          in: ["TODO", "IN_PROGRESS"],
        },
      },
    }),
    prisma.timeEntry.aggregate({
      where: {
        userId,
        startTime: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      _sum: {
        duration: true,
      },
    }),
    prisma.task.findMany({
      where: {
        assignedToId: userId,
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: {
          not: "COMPLETED",
        },
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
    }),
    prisma.activityLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ])

  const hoursThisWeek = Math.round((timeEntriesThisWeek._sum.duration || 0) / 60 * 10) / 10

  return {
    projectCount,
    activeTaskCount,
    hoursThisWeek,
    upcomingDeadlines,
    recentActivity,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  const data = await getDashboardData(userId)

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
            <div className="text-2xl font-bold">{data.projectCount}</div>
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
            <div className="text-2xl font-bold">{data.activeTaskCount}</div>
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
            <div className="text-2xl font-bold">{data.hoursThisWeek}h</div>
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
            <div className="text-2xl font-bold">{data.upcomingDeadlines.length}</div>
            <p className="text-xs text-gray-500">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingDeadlines.map((task) => (
                  <div key={task.id} className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.project.name}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(task.dueDate!).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        {activity.action} {activity.entityType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <a
              href="/dashboard/time-tracking"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Start Timer</span>
            </a>
            <a
              href="/dashboard/projects"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <FolderKanban className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">New Project</span>
            </a>
            <a
              href="/dashboard/companies"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Add Company</span>
            </a>
            <a
              href="/dashboard/calendar"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">View Calendar</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
