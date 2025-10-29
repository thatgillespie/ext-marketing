import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FolderKanban,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Edit,
  Plus,
  CheckSquare,
  Users,
  AlertCircle,
} from "lucide-react"

async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      company: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      tasks: {
        include: {
          assignedTo: {
            select: {
              name: true,
              avatar: true,
            },
          },
          subtasks: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      timeEntries: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          startTime: "desc",
        },
        take: 10,
      },
    },
  })

  return project
}

const statusColors = {
  PLANNING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  ON_HOLD: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const taskStatusColors = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  IN_REVIEW: "bg-purple-100 text-purple-800",
  BLOCKED: "bg-red-100 text-red-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
}

const priorityColors = {
  LOW: "text-gray-600",
  MEDIUM: "text-blue-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600",
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  const completedTasks = project.tasks.filter((t) => t.status === "COMPLETED").length
  const progress = project.tasks.length > 0
    ? Math.round((completedTasks / project.tasks.length) * 100)
    : 0

  const totalHours = project.timeEntries.reduce(
    (sum, entry) => sum + (entry.duration || 0),
    0
  )
  const hoursTracked = Math.round((totalHours / 60) * 10) / 10

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <FolderKanban className="h-8 w-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[project.status]
                }`}
              >
                {project.status.replace("_", " ")}
              </span>
              <span
                className={`text-sm font-medium ${priorityColors[project.priority]}`}
              >
                {project.priority}
              </span>
            </div>
            {project.description && (
              <p className="text-gray-500">{project.description}</p>
            )}
            <Link
              href={`/dashboard/companies/${project.company.id}`}
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
            >
              <Building2 className="h-4 w-4" />
              {project.company.name}
            </Link>
          </div>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Project
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="text-2xl font-bold">{progress}%</p>
              </div>
              <CheckSquare className="h-8 w-8 text-gray-400" />
            </div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tasks</p>
                <p className="text-2xl font-bold">
                  {completedTasks}/{project.tasks.length}
                </p>
              </div>
              <CheckSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hours Tracked</p>
                <p className="text-2xl font-bold">{hoursTracked}h</p>
                {project.estimatedHours && (
                  <p className="text-xs text-gray-500">
                    of {project.estimatedHours}h estimated
                  </p>
                )}
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {project.budget && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-2xl font-bold">
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tasks</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              {project.tasks.length === 0 ? (
                <p className="text-sm text-gray-500">No tasks added</p>
              ) : (
                <div className="space-y-2">
                  {project.tasks.map((task) => {
                    const completedSubtasks = task.subtasks.filter(
                      (s) => s.completed
                    ).length

                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  taskStatusColors[task.status]
                                }`}
                              >
                                {task.status.replace("_", " ")}
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  priorityColors[task.priority]
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-500 mb-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            {task.assignedTo && (
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                                  {task.assignedTo.name?.charAt(0)}
                                </div>
                                <span className="text-gray-600">
                                  {task.assignedTo.name}
                                </span>
                              </div>
                            )}
                            {task.subtasks.length > 0 && (
                              <span className="text-gray-500">
                                {completedSubtasks}/{task.subtasks.length} subtasks
                              </span>
                            )}
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Calendar className="h-4 w-4" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {project.startDate && (
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {project.endDate && (
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p className="font-medium">
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Created By</p>
                <p className="font-medium">{project.createdBy.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {project.members.length === 0 ? (
                <p className="text-sm text-gray-500">No team members</p>
              ) : (
                <div className="space-y-3">
                  {project.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                        {member.user.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.user.name}</p>
                        {member.role && (
                          <p className="text-xs text-gray-500">{member.role}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Time Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {project.timeEntries.length === 0 ? (
                <p className="text-sm text-gray-500">No time tracked</p>
              ) : (
                <div className="space-y-3">
                  {project.timeEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{entry.user.name}</span>
                        <span className="text-gray-600">
                          {Math.round((entry.duration || 0) / 60 * 10) / 10}h
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
