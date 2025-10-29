"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FolderKanban,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Edit,
  CheckSquare,
} from "lucide-react"
import { KanbanBoard } from "@/components/tasks/kanban-board"

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project
        const projectRes = await fetch(`/api/projects/${projectId}`)
        if (projectRes.ok) {
          const projectData = await projectRes.json()
          setProject(projectData)

          // Fetch company
          const companyRes = await fetch(`/api/companies/${projectData.companyId}`)
          if (companyRes.ok) {
            const companyData = await companyRes.json()
            setCompany(companyData)
          }
        }

        // Fetch tasks
        const tasksRes = await fetch(`/api/tasks?projectId=${projectId}`)
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(tasksData)
        }
      } catch (error) {
        console.error('Failed to fetch project data:', error)
      } finally {
        setLoading(false)
      }
    }

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
  const progress = tasks.length > 0
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0

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
            {company && (
              <Link
                href={`/dashboard/companies/${company.id}`}
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
              >
                <Building2 className="h-4 w-4" />
                {company.name}
              </Link>
            )}
          </div>
        </div>
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
                  {completedTasks}/{tasks.length}
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
                <p className="text-sm text-gray-500">Estimated Hours</p>
                <p className="text-2xl font-bold">
                  {project.estimatedHours || 0}h
                </p>
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

      {/* Project Details Sidebar */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
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
                <p className="text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="lg:col-span-3">
          <KanbanBoard projectId={projectId} />
        </div>
      </div>
    </div>
  )
}
