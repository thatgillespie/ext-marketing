"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TimeEntry } from "@/lib/types/time-entry"

interface TimeEntryFormProps {
  entry?: TimeEntry
  projectId?: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function TimeEntryForm({ entry, projectId: initialProjectId, open, onClose, onSuccess }: TimeEntryFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [formData, setFormData] = useState({
    description: entry?.description || "",
    projectId: entry?.projectId || initialProjectId || "",
    taskId: entry?.taskId || "",
    startDate: entry?.startTime
      ? new Date(entry.startTime).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    startTime: entry?.startTime
      ? new Date(entry.startTime).toTimeString().slice(0, 5)
      : "09:00",
    endTime: entry?.endTime
      ? new Date(entry.endTime).toTimeString().slice(0, 5)
      : "",
    billable: entry ? entry.billable : true,
  })

  // Fetch projects - placeholder since we don't have GET endpoint yet
  useEffect(() => {
    // For now, skip loading projects list
    // In production this would fetch from /api/projects
  }, [])

  // Fetch tasks when project changes
  useEffect(() => {
    if (formData.projectId) {
      fetch(`/api/tasks?projectId=${formData.projectId}`)
        .then(res => res.json())
        .then(data => setTasks(data))
        .catch(err => console.error('Failed to load tasks:', err))
    } else {
      setTasks([])
    }
  }, [formData.projectId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Construct start and end timestamps
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = formData.endTime
        ? new Date(`${formData.startDate}T${formData.endTime}`)
        : null

      // Validate times
      if (endDateTime && endDateTime <= startDateTime) {
        throw new Error("End time must be after start time")
      }

      const url = entry ? `/api/time-entries/${entry.id}` : "/api/time-entries"
      const method = entry ? "PATCH" : "POST"

      const payload = {
        description: formData.description || null,
        projectId: formData.projectId,
        taskId: formData.taskId || null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime ? endDateTime.toISOString() : null,
        billable: formData.billable,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save time entry")
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Time Entry" : "Add Time Entry"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What did you work on?"
            />
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label htmlFor="projectId">Project *</Label>
            <Input
              id="projectId"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required
              placeholder="Enter project ID"
              disabled={!!initialProjectId}
            />
            <p className="text-xs text-gray-500">
              {initialProjectId ? "Project is preset" : "Enter the project ID"}
            </p>
          </div>

          {/* Task */}
          {tasks.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="taskId">Task (optional)</Label>
              <select
                id="taskId"
                name="taskId"
                value={formData.taskId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">No task</option>
                {tasks.map((task: any) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date and Times */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Billable */}
          <div className="flex items-center gap-2">
            <input
              id="billable"
              name="billable"
              type="checkbox"
              checked={formData.billable}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="billable" className="cursor-pointer">
              Billable
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : entry ? "Update Entry" : "Add Entry"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
