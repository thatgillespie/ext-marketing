"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  FolderKanban,
  Building2,
  Edit,
} from "lucide-react"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { ProjectStats } from "@/components/projects/project-stats"
import { ProjectOverview } from "@/components/projects/project-overview"
import { TeamMembersCard } from "@/components/projects/team-members-card"
import { ProjectActivityCard } from "@/components/projects/project-activity-card"
import { ProjectEditModal } from "@/components/forms/project-edit-modal"

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
  const [showEditModal, setShowEditModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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

  useEffect(() => {
    fetchData()
  }, [projectId, refreshKey])

  const handleProjectUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

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
        <Button onClick={() => setShowEditModal(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Project
        </Button>
      </div>

      {/* Project Stats */}
      <ProjectStats
        stats={{
          totalTasks: tasks.length,
          completedTasks,
          progress,
          estimatedHours: project.estimatedHours,
          hoursTracked: 0, // TODO: Calculate from time entries
          budget: project.budget,
          overdueTasks,
        }}
      />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-6">
          <ProjectOverview
            project={{
              description: project.description,
              startDate: project.startDate,
              endDate: project.endDate,
              createdAt: project.createdAt,
              companyName: company?.name,
            }}
          />

          <TeamMembersCard projectId={projectId} />

          <ProjectActivityCard projectId={projectId} />
        </div>

        {/* Kanban Board */}
        <div className="lg:col-span-3">
          <KanbanBoard projectId={projectId} />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && project && (
        <ProjectEditModal
          project={project}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleProjectUpdate}
        />
      )}
    </div>
  )
}
