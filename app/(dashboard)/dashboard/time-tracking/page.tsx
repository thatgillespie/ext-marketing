"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock, TrendingUp } from "lucide-react"
import { ActiveTimer } from "@/components/time-tracking/active-timer"
import { TimeEntriesList } from "@/components/time-tracking/time-entries-list"
import { TimeEntryForm } from "@/components/time-tracking/time-entry-form"
import { TimeEntry, formatDuration } from "@/lib/types/time-entry"

export default function TimeTrackingPage() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchEntries = async () => {
    if (!session?.user) return

    try {
      const userId = (session.user as any).id
      const response = await fetch(`/api/time-entries?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to fetch time entries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [session, refreshKey])

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Calculate stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime()

  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()) // Start of week
  thisWeek.setHours(0, 0, 0, 0)
  const weekTimestamp = thisWeek.getTime()

  const todayEntries = entries.filter(e => e.startTime >= todayTimestamp)
  const weekEntries = entries.filter(e => e.startTime >= weekTimestamp)

  const todayMinutes = todayEntries.reduce((sum, e) => sum + (e.duration || 0), 0)
  const weekMinutes = weekEntries.reduce((sum, e) => sum + (e.duration || 0), 0)
  const billableWeekMinutes = weekEntries
    .filter(e => e.billable)
    .reduce((sum, e) => sum + (e.duration || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-gray-500">Track your time and manage entries</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-2xl font-bold">{formatDuration(todayMinutes)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-2xl font-bold">{formatDuration(weekMinutes)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {weekEntries.length} {weekEntries.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Billable This Week</p>
                <p className="text-2xl font-bold">{formatDuration(billableWeekMinutes)}</p>
                {weekMinutes > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((billableWeekMinutes / weekMinutes) * 100)}% of total
                  </p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Timer */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div>
          <ActiveTimer onTimerStop={handleUpdate} />
        </div>

        {/* Time Entries */}
        <div className="lg:col-span-3">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Loading time entries...</p>
              </CardContent>
            </Card>
          ) : (
            <TimeEntriesList entries={entries} onUpdate={handleUpdate} />
          )}
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <TimeEntryForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            handleUpdate()
          }}
        />
      )}
    </div>
  )
}
