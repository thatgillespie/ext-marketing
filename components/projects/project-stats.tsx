"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckSquare, Clock, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"

interface ProjectStatsProps {
  stats: {
    totalTasks: number
    completedTasks: number
    progress: number
    estimatedHours?: number
    hoursTracked: number
    budget?: number
    overdueTasks: number
  }
}

export function ProjectStats({ stats }: ProjectStatsProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-2xl font-bold">{stats.progress}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(stats.progress)} rounded-full transition-all`}
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.completedTasks} of {stats.totalTasks} tasks complete
          </p>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasks</p>
              <p className="text-2xl font-bold">
                {stats.completedTasks}/{stats.totalTasks}
              </p>
              {stats.overdueTasks > 0 && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.overdueTasks} overdue
                </p>
              )}
            </div>
            <CheckSquare className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* Hours */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hours Tracked</p>
              <p className="text-2xl font-bold">{stats.hoursTracked}h</p>
              {stats.estimatedHours && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    of {stats.estimatedHours}h estimated
                  </p>
                  <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min((stats.hoursTracked / stats.estimatedHours) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* Budget */}
      {stats.budget && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="text-2xl font-bold">
                  ${stats.budget.toLocaleString()}
                </p>
                {stats.estimatedHours && (
                  <p className="text-xs text-gray-500 mt-1">
                    ${Math.round(stats.budget / stats.estimatedHours)}/hour
                  </p>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
