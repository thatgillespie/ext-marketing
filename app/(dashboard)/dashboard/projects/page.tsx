import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Building2, Users, CheckSquare, DollarSign, Calendar } from "lucide-react"

async function getProjects() {
  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      company: {
        select: {
          name: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
        take: 5,
      },
      tasks: {
        where: {
          status: {
            not: "COMPLETED",
          },
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  })

  return projects
}

const statusColors = {
  PLANNING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  ON_HOLD: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const priorityColors = {
  LOW: "text-gray-600",
  MEDIUM: "text-blue-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600",
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-500">Manage your agency projects</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => {
          const completedTasks = project._count.tasks - project.tasks.length
          const progress = project._count.tasks > 0
            ? Math.round((completedTasks / project._count.tasks) * 100)
            : 0

          return (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[project.status]
                            }`}
                          >
                            {project.status.replace("_", " ")}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              priorityColors[project.priority]
                            }`}
                          >
                            {project.priority}
                          </span>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{project.company.name}</span>
                      </div>

                      {project.members.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {project.members.length} members
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <CheckSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {completedTasks}/{project._count.tasks} tasks
                        </span>
                      </div>

                      {project.budget && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            ${project.budget.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {project.startDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {new Date(project.startDate).toLocaleDateString()}
                            {project.endDate &&
                              ` - ${new Date(project.endDate).toLocaleDateString()}`
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {project._count.tasks > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs font-medium text-gray-700">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Team Members */}
                    {project.members.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Team:</span>
                        <div className="flex -space-x-2">
                          {project.members.slice(0, 5).map((member) => (
                            <div
                              key={member.id}
                              className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-white"
                              title={member.user.name || undefined}
                            >
                              {member.user.name?.charAt(0) || "?"}
                            </div>
                          ))}
                          {project.members.length > 5 && (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium border-2 border-white">
                              +{project.members.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No projects found</p>
            <Link href="/dashboard/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
