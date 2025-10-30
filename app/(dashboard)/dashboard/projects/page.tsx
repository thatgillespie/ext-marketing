"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Building2, Users, CheckSquare, DollarSign, Calendar } from "lucide-react"

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading projects...</p>
      </div>
    )
  }

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
          const totalTasks = project.taskCount || 0
          const completedTasks = project.completedTaskCount || 0
          const progress = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
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
                              statusColors[project.status as keyof typeof statusColors] || statusColors.PLANNING
                            }`}
                          >
                            {project.status.replace("_", " ")}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              priorityColors[project.priority as keyof typeof priorityColors] || priorityColors.MEDIUM
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
                        <span className="text-gray-600">{project.companyName || 'No company'}</span>
                      </div>

                      {project.memberCount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {project.memberCount} members
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <CheckSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {completedTasks}/{totalTasks} tasks
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
                    {totalTasks > 0 && (
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
