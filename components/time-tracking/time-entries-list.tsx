"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { TimeEntry, formatDuration, formatTime } from "@/lib/types/time-entry"
import { TimeEntryForm } from "./time-entry-form"

interface TimeEntriesListProps {
  entries: TimeEntry[]
  onUpdate: () => void
}

export function TimeEntriesList({ entries, onUpdate }: TimeEntriesListProps) {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onUpdate()
      } else {
        alert('Failed to delete time entry')
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
      alert('Failed to delete time entry')
    } finally {
      setDeleting(null)
    }
  }

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.startTime).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, TimeEntry[]>)

  const dates = Object.keys(groupedEntries).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No time entries yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {dates.map(date => {
          const dayEntries = groupedEntries[date]
          const totalMinutes = dayEntries.reduce((sum, entry) =>
            sum + (entry.duration || 0), 0
          )

          return (
            <Card key={date}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </CardTitle>
                  <span className="text-sm font-medium text-gray-600">
                    Total: {formatDuration(totalMinutes)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dayEntries.map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {entry.billable ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="font-medium text-sm">
                            {entry.projectName || 'No Project'}
                          </span>
                          {entry.taskTitle && (
                            <span className="text-sm text-gray-500">
                              • {entry.taskTitle}
                            </span>
                          )}
                        </div>
                        {entry.description && (
                          <p className="text-sm text-gray-600 ml-6">
                            {entry.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500 ml-6 mt-1">
                          <span>{formatTime(entry.startTime)}</span>
                          {entry.endTime && (
                            <>
                              <span>→</span>
                              <span>{formatTime(entry.endTime)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-medium">
                          {entry.duration ? formatDuration(entry.duration) : '-'}
                        </span>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingEntry(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deleting === entry.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <TimeEntryForm
          entry={editingEntry}
          open={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          onSuccess={() => {
            setEditingEntry(null)
            onUpdate()
          }}
        />
      )}
    </>
  )
}
