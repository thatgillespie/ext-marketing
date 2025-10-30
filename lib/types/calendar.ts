export type EventType = 'MEETING' | 'DEADLINE' | 'MILESTONE' | 'REMINDER' | 'OTHER'

export interface CalendarEvent {
  id: string
  title: string
  description?: string | null
  startTime: string
  endTime: string
  allDay: boolean
  location?: string | null
  color?: string | null
  type: EventType
  userId?: string | null
  userName?: string | null
  projectId?: string | null
  projectName?: string | null
  createdAt: string
  updatedAt: string
}

export interface CalendarEventFormData {
  title: string
  description?: string
  startTime: string
  endTime: string
  allDay?: boolean
  location?: string
  color?: string
  type: EventType
  userId?: string
  projectId?: string
}

// Event type colors
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  MEETING: '#3b82f6',      // blue
  DEADLINE: '#ef4444',     // red
  MILESTONE: '#10b981',    // green
  REMINDER: '#f59e0b',     // amber
  OTHER: '#6b7280',        // gray
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  MEETING: 'Meeting',
  DEADLINE: 'Deadline',
  MILESTONE: 'Milestone',
  REMINDER: 'Reminder',
  OTHER: 'Other',
}

// Helper to format time for display
export function formatEventTime(startTime: string, endTime: string, allDay: boolean): string {
  if (allDay) {
    return 'All day'
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  const startStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const endStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return `${startStr} - ${endStr}`
}

// Helper to get event duration in minutes
export function getEventDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime)
  const end = new Date(endTime)
  return Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
}

// Helper to check if event is today
export function isEventToday(startTime: string): boolean {
  const eventDate = new Date(startTime)
  const today = new Date()

  return eventDate.getDate() === today.getDate() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getFullYear() === today.getFullYear()
}

// Helper to check if event is in the past
export function isEventPast(endTime: string): boolean {
  return new Date(endTime) < new Date()
}

// Helper to get calendar grid (month view)
export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days: Date[] = []

  // Add days from previous month to fill the first week
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, 0 - i)
    days.push(date)
  }

  // Add all days of the current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // Add days from next month to fill the last week
  const lastDayOfWeek = lastDay.getDay()
  for (let i = 1; i < 7 - lastDayOfWeek; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

// Helper to check if two dates are the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
}

// Helper to get events for a specific day
export function getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter(event => {
    const eventDate = new Date(event.startTime)
    return isSameDay(eventDate, date)
  })
}

// Helper to format date for input fields
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
