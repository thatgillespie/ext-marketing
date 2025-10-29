export interface TimeEntry {
  id: string
  description?: string
  startTime: number
  endTime?: number
  duration?: number  // in minutes
  billable: boolean
  userId: string
  userName?: string
  taskId?: string
  taskTitle?: string
  projectId: string
  projectName?: string
  createdAt: number
  updatedAt: number
}

export interface TimerState {
  isRunning: boolean
  startTime?: number
  description?: string
  projectId?: string
  taskId?: string
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
  }

  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
