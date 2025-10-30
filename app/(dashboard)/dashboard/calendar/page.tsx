"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MonthView } from "@/components/calendar/month-view"
import { EventFormModal } from "@/components/calendar/event-form-modal"
import { EventDetailModal } from "@/components/calendar/event-detail-modal"
import { UpcomingEvents } from "@/components/calendar/upcoming-events"
import { CalendarEvent } from "@/lib/types/calendar"

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>(undefined)

  const fetchEvents = async () => {
    try {
      // Fetch events for the current month and surrounding months
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0)

      const response = await fetch(
        `/api/calendar-events?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
      )

      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentDate, refreshKey])

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setPreselectedDate(undefined)
    setIsFormOpen(true)
  }

  const handleDayClick = (date: Date) => {
    setPreselectedDate(date)
    setSelectedEvent(null)
    setIsFormOpen(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsDetailOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsDetailOpen(false)
    setIsFormOpen(true)
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/calendar-events/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRefreshKey(prev => prev + 1)
      } else {
        alert('Failed to delete event')
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event')
    }
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-gray-500">Manage events and schedules</p>
        </div>
        <Button onClick={handleCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading calendar...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar View - Takes 2 columns */}
          <div className="lg:col-span-2">
            <MonthView
              currentDate={currentDate}
              events={events}
              onDateChange={setCurrentDate}
              onEventClick={handleEventClick}
              onDayClick={handleDayClick}
            />
          </div>

          {/* Upcoming Events Sidebar - Takes 1 column */}
          <div>
            <UpcomingEvents
              events={events}
              onEventClick={handleEventClick}
              limit={10}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <EventFormModal
        event={selectedEvent}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        preselectedDate={preselectedDate}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}
