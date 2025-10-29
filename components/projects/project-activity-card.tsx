"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckSquare, Users, FileText } from "lucide-react"

interface Activity {
  id: string
  type: 'task_created' | 'task_updated' | 'member_added' | 'project_updated'
  description: string
  timestamp: number
  user?: string
}

interface ProjectActivityCardProps {
  projectId: string
}

export function ProjectActivityCard({ projectId }: ProjectActivityCardProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For now, create mock activities based on recent tasks and members
    // In a real implementation, this would fetch from an activity log API
    const fetchActivities = async () => {
      try {
        // Fetch recent tasks
        const tasksRes = await fetch(`/api/tasks?projectId=${projectId}`)
        const tasks = tasksRes.ok ? await tasksRes.json() : []

        // Fetch project members
        const membersRes = await fetch(`/api/projects/${projectId}/members`)
        const members = membersRes.ok ? await membersRes.json() : []

        // Create activity items
        const taskActivities: Activity[] = tasks.slice(0, 5).map((task: any) => ({
          id: `task-${task.id}`,
          type: 'task_created' as const,
          description: `Task created: ${task.title}`,
          timestamp: task.createdAt,
          user: task.assignedToName || 'System'
        }))

        const memberActivities: Activity[] = members.slice(0, 3).map((member: any) => ({
          id: `member-${member.id}`,
          type: 'member_added' as const,
          description: `${member.name} joined the project`,
          timestamp: member.joinedAt,
          user: 'System'
        }))

        // Combine and sort by timestamp
        const allActivities = [...taskActivities, ...memberActivities]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10)

        setActivities(allActivities)
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [projectId])

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task_created':
      case 'task_updated':
        return <CheckSquare className="h-4 w-4 text-blue-500" />
      case 'member_added':
        return <Users className="h-4 w-4 text-green-500" />
      case 'project_updated':
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="mt-1">{getIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
