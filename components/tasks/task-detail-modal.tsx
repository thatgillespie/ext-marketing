"use client"

import { Task, TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_COLORS, PRIORITY_COLORS } from "@/lib/types/task"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Edit2, Trash2, CheckSquare } from "lucide-react"
import { useState } from "react"

interface TaskDetailModalProps {
  task: Task
  open: boolean
  onClose: () => void
  onUpdate: () => void
  onEdit: (task: Task) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

export function TaskDetailModal({ task, open, onClose, onUpdate, onEdit, onStatusChange }: TaskDetailModalProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onUpdate()
        onClose()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await onStatusChange(task.id, newStatus)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="text-xl pr-8">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className={`text-xs px-3 py-1 rounded-full font-medium ${TASK_STATUS_COLORS[task.status]}`}
              >
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Priority:</span>
              <span className={`text-sm font-medium ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assigned To */}
            {task.assignedToName && (
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Assigned to:</span>
                </div>
                <p className="text-sm font-medium mt-1 ml-6">{task.assignedToName}</p>
              </div>
            )}

            {/* Project */}
            {task.projectName && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckSquare className="h-4 w-4 text-gray-400" />
                  <span>Project:</span>
                </div>
                <p className="text-sm font-medium mt-1 ml-6">{task.projectName}</p>
              </div>
            )}

            {/* Start Date */}
            {task.startDate && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Start Date:</span>
                </div>
                <p className="text-sm font-medium mt-1 ml-6">
                  {new Date(task.startDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Due Date:</span>
                </div>
                <p className={`text-sm font-medium mt-1 ml-6 ${
                  task.dueDate < Date.now() && task.status !== 'COMPLETED' ? 'text-red-600' : ''
                }`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Estimated Hours */}
            {task.estimatedHours && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Estimated:</span>
                </div>
                <p className="text-sm font-medium mt-1 ml-6">{task.estimatedHours} hours</p>
              </div>
            )}

            {/* Actual Hours */}
            {task.actualHours && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Actual:</span>
                </div>
                <p className="text-sm font-medium mt-1 ml-6">{task.actualHours} hours</p>
              </div>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Subtasks</h4>
              <div className="space-y-2">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      readOnly
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className={`text-sm ${subtask.completed ? 'line-through text-gray-400' : ''}`}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t space-y-1">
            <p className="text-xs text-gray-500">
              Created: {new Date(task.createdAt).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Updated: {new Date(task.updatedAt).toLocaleString()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onEdit(task)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Task
            </Button>

            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
