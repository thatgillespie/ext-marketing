"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Square, Clock } from "lucide-react"
import { formatDuration } from "@/lib/types/time-entry"

interface ActiveTimerProps {
  onTimerStop?: (entry: any) => void
}

export function ActiveTimer({ onTimerStop }: ActiveTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState("")
  const [taskId, setTaskId] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  // Fetch projects
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        // For now, we'll need to create an endpoint that lists projects
        // Temporarily skip this
      })
      .catch(err => console.error('Failed to load projects:', err))
  }, [])

  // Fetch tasks when project changes
  useEffect(() => {
    if (projectId) {
      fetch(`/api/tasks?projectId=${projectId}`)
        .then(res => res.json())
        .then(data => setTasks(data))
        .catch(err => console.error('Failed to load tasks:', err))
    } else {
      setTasks([])
    }
  }, [projectId])

  // Update elapsed time
  useEffect(() => {
    if (!isRunning || !startTime) return

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, startTime])

  // Load saved timer state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('activeTimer')
    if (saved) {
      const timer = JSON.parse(saved)
      setIsRunning(true)
      setStartTime(timer.startTime)
      setDescription(timer.description || "")
      setProjectId(timer.projectId || "")
      setTaskId(timer.taskId || "")
    }
  }, [])

  const handleStart = () => {
    const now = Date.now()
    setIsRunning(true)
    setStartTime(now)
    setElapsed(0)

    // Save to localStorage
    localStorage.setItem('activeTimer', JSON.stringify({
      startTime: now,
      description,
      projectId,
      taskId
    }))
  }

  const handleStop = async () => {
    if (!startTime) return

    setSaving(true)

    try {
      const endTime = Date.now()
      const duration = Math.floor((endTime - startTime) / 60000) // minutes

      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description || null,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          projectId: projectId || null,
          taskId: taskId || null,
          billable: true
        })
      })

      if (response.ok) {
        const entry = await response.json()

        // Reset timer
        setIsRunning(false)
        setStartTime(null)
        setElapsed(0)
        setDescription("")
        setProjectId("")
        setTaskId("")

        // Clear localStorage
        localStorage.removeItem('activeTimer')

        // Callback
        onTimerStop?.(entry)
      } else {
        alert('Failed to save time entry')
      }
    } catch (error) {
      console.error('Failed to stop timer:', error)
      alert('Failed to save time entry')
    } finally {
      setSaving(false)
    }
  }

  const elapsedMinutes = Math.floor(elapsed / 60)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className={`h-5 w-5 ${isRunning ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-500">
                {isRunning ? 'Timer Running' : 'Timer Stopped'}
              </span>
            </div>
            <div className="text-4xl font-bold font-mono">
              {formatDuration(elapsedMinutes)}
            </div>
            {isRunning && startTime && (
              <div className="text-xs text-gray-500 mt-1">
                Started at {new Date(startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            )}
          </div>

          {/* Description */}
          {!isRunning && (
            <div className="space-y-2">
              <Label htmlFor="description">What are you working on?</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
              />
            </div>
          )}

          {isRunning && description && (
            <div className="text-sm text-center text-gray-600">
              {description}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                className="w-full"
                disabled={!projectId}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                variant="outline"
                className="w-full"
                disabled={saving}
              >
                <Square className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Stop Timer'}
              </Button>
            )}
          </div>

          {!projectId && !isRunning && (
            <p className="text-xs text-orange-600 text-center">
              Please select a project to start tracking time
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
