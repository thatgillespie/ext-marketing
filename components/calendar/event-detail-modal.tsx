"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Edit, Trash2, Clock, MapPin, User, FolderKanban, Calendar } from "lucide-react"
import { CalendarEvent, formatEventTime, EVENT_TYPE_LABELS } from "@/lib/types/calendar"

interface EventDetailModalProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
}

export function EventDetailModal({ event, isOpen, onClose, onEdit, onDelete }: EventDetailModalProps) {
  if (!isOpen || !event) return null

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2">{event.title}</CardTitle>
            <div
              className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: event.color || '#3b82f6' }}
            >
              {EVENT_TYPE_LABELS[event.type]}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          {event.description && (
            <div>
              <p className="text-sm text-gray-700">{event.description}</p>
            </div>
          )}

          {/* Time */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">
                {new Date(event.startTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600">
                {formatEventTime(event.startTime, event.endTime, event.allDay)}
              </p>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-sm font-medium">{event.location}</p>
              </div>
            </div>
          )}

          {/* Assigned User */}
          {event.userName && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Assigned to</p>
                <p className="text-sm font-medium">{event.userName}</p>
              </div>
            </div>
          )}

          {/* Project */}
          {event.projectName && (
            <div className="flex items-start gap-3">
              <FolderKanban className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Project</p>
                <p className="text-sm font-medium">{event.projectName}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={() => onEdit(event)} className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete} className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
