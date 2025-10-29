"use client"

import { useState, useEffect } from "react"
import { Task, TaskStatus, TASK_STATUS_LABELS } from "@/lib/types/task"
import { TaskCard } from "./task-card"
import { TaskDetailModal } from "./task-detail-modal"
import { TaskFormModal } from "./task-form-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface KanbanBoardProps {
  projectId: string
}

const KANBAN_COLUMNS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const handleTaskClick = async (task: Task) => {
    // Fetch full task details including subtasks
    try {
      const response = await fetch(`/api/tasks/${task.id}`)
      if (response.ok) {
        const fullTask = await response.json()
        setSelectedTask(fullTask)
      }
    } catch (error) {
      console.error('Failed to fetch task details:', error)
    }
  }

  const handleTaskUpdate = async () => {
    await fetchTasks()
    setSelectedTask(null)
    setEditingTask(null)
  }

  const handleTaskCreate = async () => {
    await fetchTasks()
    setShowTaskForm(false)
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KANBAN_COLUMNS.map(status => {
          const columnTasks = getTasksByStatus(status)

          return (
            <div key={status} className="flex flex-col min-h-[400px]">
              {/* Column Header */}
              <div className="bg-gray-100 rounded-t-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{TASK_STATUS_LABELS[status]}</h3>
                  <span className="text-xs bg-white px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3 flex-1">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">
                    No tasks
                  </div>
                ) : (
                  columnTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={handleTaskClick}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onEdit={(task) => {
            setEditingTask(task)
            setSelectedTask(null)
          }}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Task Form Modal (Create) */}
      {showTaskForm && (
        <TaskFormModal
          projectId={projectId}
          open={showTaskForm}
          onClose={() => setShowTaskForm(false)}
          onSuccess={handleTaskCreate}
        />
      )}

      {/* Task Form Modal (Edit) */}
      {editingTask && (
        <TaskFormModal
          projectId={projectId}
          task={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={handleTaskUpdate}
        />
      )}
    </div>
  )
}
