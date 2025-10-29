"use client"

import { Task, TASK_STATUS_COLORS, PRIORITY_COLORS } from "@/lib/types/task"
import { Calendar, Clock, User, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status !== 'COMPLETED'

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{
        borderLeftColor: task.priority === 'URGENT' ? '#ef4444' :
                        task.priority === 'HIGH' ? '#f97316' :
                        task.priority === 'MEDIUM' ? '#3b82f6' : '#9ca3af'
      }}
      onClick={() => onClick(task)}
    >
      <div className="space-y-3">
        {/* Title */}
        <div>
          <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              {isOverdue && <AlertCircle className="h-3 w-3 ml-1" />}
            </div>
          )}

          {/* Estimated Hours */}
          {task.estimatedHours && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}

          {/* Assigned To */}
          {task.assignedToName && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <User className="h-3 w-3" />
              <span className="truncate">{task.assignedToName}</span>
            </div>
          )}
        </div>

        {/* Priority Badge */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>

          {/* Subtasks count if exists */}
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="text-xs text-gray-500">
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
