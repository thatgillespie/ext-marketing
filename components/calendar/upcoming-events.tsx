"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarEvent, formatEventTime, isEventToday, isEventPast } from "@/lib/types/calendar"
import { Clock, MapPin } from "lucide-react"

interface UpcomingEventsProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  limit?: number
}

export function UpcomingEvents({ events, onEventClick, limit = 5 }: UpcomingEventsProps) {
  // Filter to upcoming events and sort by start time
  const upcomingEvents = events
    .filter(event => !isEventPast(event.endTime))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, limit)

  if (upcomingEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No upcoming events</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingEvents.map(event => {
            const eventDate = new Date(event.startTime)
            const today = isEventToday(event.startTime)

            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Color indicator */}
                  <div
                    className="w-1 h-full rounded-full mt-1"
                    style={{ backgroundColor: event.color || '#3b82f6' }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold truncate">{event.title}</p>
                      {today && (
                        <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {eventDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                        {' • '}
                        {formatEventTime(event.startTime, event.endTime, event.allDay)}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {(event.projectName || event.userName) && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        {event.projectName && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded">
                            {event.projectName}
                          </span>
                        )}
                        {event.userName && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded">
                            {event.userName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
