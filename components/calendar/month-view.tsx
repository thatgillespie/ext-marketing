"use client"

import { CalendarEvent, getCalendarDays, isSameDay, getEventsForDay } from "@/lib/types/calendar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateChange: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onDayClick: (date: Date) => void
}

export function MonthView({
  currentDate,
  events,
  onDateChange,
  onEventClick,
  onDayClick
}: MonthViewProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const days = getCalendarDays(year, month)
  const today = new Date()

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const previousMonth = () => {
    onDateChange(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    onDateChange(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{monthName}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === month
            const isToday = isSameDay(date, today)
            const dayEvents = getEventsForDay(events, date)

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                } cursor-pointer transition-colors`}
                onClick={() => onDayClick(date)}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? 'w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center'
                      : !isCurrentMonth
                      ? 'text-gray-400'
                      : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: event.color || '#3b82f6',
                        color: 'white'
                      }}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
