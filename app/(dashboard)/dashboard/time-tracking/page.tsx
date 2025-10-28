import { getServerSession } from "next/auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Play, Square, Calendar, TrendingUp } from "lucide-react"

async function getTimeTrackingData(userId: string) {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [recentEntries, weekTotal, monthTotal, activeEntry] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        userId,
      },
      include: {
        project: {
          select: {
            name: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        task: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
      take: 20,
    }),
    prisma.timeEntry.aggregate({
      where: {
        userId,
        startTime: {
          gte: startOfWeek,
        },
      },
      _sum: {
        duration: true,
      },
    }),
    prisma.timeEntry.aggregate({
      where: {
        userId,
        startTime: {
          gte: startOfMonth,
        },
      },
      _sum: {
        duration: true,
      },
    }),
    prisma.timeEntry.findFirst({
      where: {
        userId,
        endTime: null,
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
        task: {
          select: {
            title: true,
          },
        },
      },
    }),
  ])

  const weekHours = Math.round(((weekTotal._sum.duration || 0) / 60) * 10) / 10
  const monthHours = Math.round(((monthTotal._sum.duration || 0) / 60) * 10) / 10

  return {
    recentEntries,
    weekHours,
    monthHours,
    activeEntry,
  }
}

export default async function TimeTrackingPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  const data = await getTimeTrackingData(userId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-gray-500">Track your time on projects and tasks</p>
        </div>
      </div>

      {/* Timer Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-8">
          {data.activeEntry ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Timer Running
                  </h3>
                  <p className="text-sm text-gray-500">
                    {data.activeEntry.project.name}
                    {data.activeEntry.task && ` - ${data.activeEntry.task.title}`}
                  </p>
                </div>
                <Button variant="destructive" size="lg">
                  <Square className="mr-2 h-5 w-5" />
                  Stop Timer
                </Button>
              </div>
              <div className="text-4xl font-bold text-center py-6">
                {(() => {
                  const elapsed = Date.now() - new Date(data.activeEntry.startTime).getTime()
                  const hours = Math.floor(elapsed / 3600000)
                  const minutes = Math.floor((elapsed % 3600000) / 60000)
                  const seconds = Math.floor((elapsed % 60000) / 1000)
                  return `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                })()}
              </div>
              {data.activeEntry.description && (
                <p className="text-sm text-gray-600">{data.activeEntry.description}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Timer Running</h3>
              <p className="text-sm text-gray-500 mb-6">
                Start tracking time on a project or task
              </p>
              <Button size="lg">
                <Play className="mr-2 h-5 w-5" />
                Start Timer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Week
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.weekHours}h</div>
            <p className="text-xs text-gray-500">Tracked time this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.monthHours}h</div>
            <p className="text-xs text-gray-500">Tracked time this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Billable Rate
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.recentEntries.length > 0
                ? Math.round(
                    (data.recentEntries.filter((e) => e.billable).length /
                      data.recentEntries.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-gray-500">Of recent entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentEntries.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No time entries yet. Start tracking your time!
            </p>
          ) : (
            <div className="space-y-2">
              {data.recentEntries.map((entry) => {
                const duration = entry.duration
                  ? Math.round((entry.duration / 60) * 10) / 10
                  : 0

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{entry.project.name}</h4>
                        {entry.billable && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            Billable
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.project.company.name}
                        {entry.task && ` • ${entry.task.title}`}
                      </div>
                      {entry.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {entry.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{duration}h</div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.startTime).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(entry.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {entry.endTime &&
                          ` - ${new Date(entry.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
