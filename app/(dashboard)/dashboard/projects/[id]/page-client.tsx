"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FolderKanban,
  Building2,
  Edit,
  CheckSquare,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react"

// Dynamic imports to avoid SSR issues
const KanbanBoard = dynamic(
  () => import("@/components/tasks/kanban-board").then(mod => ({ default: mod.KanbanBoard })),
  { ssr: false, loading: () => <div className="text-center py-12 text-gray-500">Loading tasks...</div> }
)

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

interface Project {
  id: string
  name: string
  description?: string
  status: keyof typeof statusColors
  priority: keyof typeof priorityColors
  startDate?: number
  endDate?: number
  budget?: number
  estimatedHours?: number
  companyId: string
  createdAt: number
  color?: string
}

interface Company {
  id: string
  name: string
}

export function ProjectDetailPageClient({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      // Fetch project
      const projectRes = await fetch(`/api/projects/${projectId}`)
      if (projectRes.ok) {
        const projectData = await projectRes.json()
        setProject(projectData)

        // Fetch company if companyId exists
        if (projectData.companyId) {
          const companyRes = await fetch(`/api/companies/${projectData.companyId}`)
          if (companyRes.ok) {
            const companyData = await companyRes.json()
            setCompany(companyData)
          }
        }
      }

      // Fetch tasks
      const tasksRes = await fetch(`/api/tasks?projectId=${projectId}`)
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(Array.isArray(tasksData) ? tasksData : [])
      }
    } catch (error) {
      console.error('Failed to fetch project data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Project not found</p>
      </div>
    )
  }

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length
  const overdueTasks = tasks.filter((t) =>
    t.dueDate && t.dueDate < Date.now() && t.status !== "COMPLETED"
  ).length
  const progress = tasks.length > 0
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className="h-16 w-16 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: project.color ? `${project.color}20` : 'rgb(59 130 246 / 0.1)' }}
          >
            <FolderKanban
              className="h-8 w-8"
              style={{ color: project.color || 'rgb(59 130 246)' }}
            />
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
            {company && (
              <Link
                href={`/dashboard/companies/${company.id}`}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Building2 className="h-4 w-4" />
                {company.name}
              </Link>
            )}
          </div>
        </div>
        <Link href={`/dashboard/projects/${project.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        </Link>
      </div>

      {/* Project Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-gray-500">{completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Progress
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress}%</div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Estimated Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.estimatedHours || 0}h</div>
            <p className="text-xs text-gray-500">Total estimate</p>
          </CardContent>
        </Card>

        {project.budget && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Budget
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${project.budget.toLocaleString()}</div>
              <p className="text-xs text-gray-500">Project budget</p>
            </CardContent>
          </Card>
        )}

        {overdueTasks > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Overdue Tasks
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
              <p className="text-xs text-gray-500">Need attention</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Project Description */}
      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Dates */}
      {(project.startDate || project.endDate) && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {project.startDate && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Start Date</p>
                <p className="text-sm font-medium">
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {project.endDate && (
              <div>
                <p className="text-sm text-gray-500 mb-1">End Date</p>
                <p className="text-sm font-medium">
                  {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <Card>
        <CardContent className="pt-6">
          <KanbanBoard projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  )
}
