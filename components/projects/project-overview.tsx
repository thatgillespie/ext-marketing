"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, Building2 } from "lucide-react"

interface ProjectOverviewProps {
  project: {
    description?: string
    startDate?: number
    endDate?: number
    createdAt: number
    companyName?: string
  }
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const calculateDuration = () => {
    if (!project.startDate || !project.endDate) return null

    const start = new Date(project.startDate)
    const end = new Date(project.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 7) return `${diffDays} days`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`
    return `${Math.ceil(diffDays / 30)} months`
  }

  const getTimeRemaining = () => {
    if (!project.endDate) return null

    const now = Date.now()
    const end = project.endDate

    if (end < now) return { text: 'Overdue', color: 'text-red-600' }

    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return { text: 'Due today', color: 'text-red-600' }
    if (diffDays === 1) return { text: '1 day left', color: 'text-orange-600' }
    if (diffDays < 7) return { text: `${diffDays} days left`, color: 'text-orange-600' }
    if (diffDays < 30) return { text: `${Math.ceil(diffDays / 7)} weeks left`, color: 'text-blue-600' }

    return { text: `${Math.ceil(diffDays / 30)} months left`, color: 'text-gray-600' }
  }

  const timeRemaining = getTimeRemaining()
  const duration = calculateDuration()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        {project.description && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="text-sm">{project.description}</p>
          </div>
        )}

        {/* Company */}
        {project.companyName && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Building2 className="h-4 w-4" />
              <span>Client</span>
            </div>
            <p className="text-sm font-medium ml-6">{project.companyName}</p>
          </div>
        )}

        {/* Timeline */}
        {(project.startDate || project.endDate) && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Calendar className="h-4 w-4" />
              <span>Timeline</span>
            </div>
            <div className="ml-6 space-y-2">
              {project.startDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Start:</span>
                  <span className="font-medium">
                    {new Date(project.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {project.endDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">End:</span>
                  <span className="font-medium">
                    {new Date(project.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {duration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{duration}</span>
                </div>
              )}
              {timeRemaining && (
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${timeRemaining.color}`}>
                    {timeRemaining.text}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created:</span>
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
