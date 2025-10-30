"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, DollarSign, FolderKanban, CheckSquare, Users, Building2, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/analytics/stat-card"
import { BarChart } from "@/components/analytics/bar-chart"
import { ProgressRing } from "@/components/analytics/progress-ring"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { formatCurrency } from "@/lib/types/invoice"

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/analytics/overview?startDate=${dateRange.start}T00:00:00.000Z&endDate=${dateRange.end}T23:59:59.999Z`
      )
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  const handleApplyFilters = () => {
    fetchAnalytics()
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    )
  }

  const billablePercentage = analytics.timeTracking.totalHours > 0
    ? (analytics.timeTracking.billableHours / analytics.timeTracking.totalHours) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-500">Track performance and insights</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Date Range:</span>
        </div>
        <Input
          type="date"
          value={dateRange.start}
          onChange={(e) => handleDateChange('start', e.target.value)}
          className="w-40"
        />
        <span className="text-gray-500">to</span>
        <Input
          type="date"
          value={dateRange.end}
          onChange={(e) => handleDateChange('end', e.target.value)}
          className="w-40"
        />
        <Button onClick={handleApplyFilters}>Apply</Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics.invoices.totalRevenue)}
          subtitle={`${analytics.invoices.total} invoices`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Tracked Hours"
          value={`${analytics.timeTracking.totalHours}h`}
          subtitle={`${analytics.timeTracking.totalEntries} entries`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Active Projects"
          value={analytics.projects.active}
          subtitle={`${analytics.projects.total} total`}
          icon={FolderKanban}
          color="purple"
        />
        <StatCard
          title="Task Completion"
          value={`${analytics.tasks.completionRate}%`}
          subtitle={`${analytics.tasks.completed}/${analytics.tasks.total} tasks`}
          icon={CheckSquare}
          color="orange"
        />
      </div>

      {/* Revenue & Financial Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart
            title="Revenue Trend (Last 6 Months)"
            data={analytics.revenueByMonth.reverse()}
          />
        </div>
        <div className="space-y-6">
          <StatCard
            title="Paid Revenue"
            value={formatCurrency(analytics.invoices.paidRevenue)}
            subtitle="Received payments"
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Pending Revenue"
            value={formatCurrency(analytics.invoices.pendingRevenue)}
            subtitle="Awaiting payment"
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Overdue Revenue"
            value={formatCurrency(analytics.invoices.overdueRevenue)}
            subtitle="Payment overdue"
            icon={DollarSign}
            color="red"
          />
        </div>
      </div>

      {/* Time Tracking Analysis */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ProgressRing
          title="Billable Hours"
          percentage={billablePercentage}
          label={`${analytics.timeTracking.billableHours}h / ${analytics.timeTracking.totalHours}h`}
          color="#10b981"
        />

        <div className="lg:col-span-2">
          <BarChart
            title="Top Projects by Time"
            data={analytics.timeByProject.map((p: any) => ({
              label: p.name,
              value: p.totalMinutes / 60,
              color: '#3b82f6'
            }))}
            valueFormatter={(v) => `${Math.round(v * 10) / 10}h`}
          />
        </div>
      </div>

      {/* Team Productivity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart
          title="Team Member Hours"
          data={analytics.timeByUser.map((u: any) => ({
            label: u.name || u.email,
            value: u.totalMinutes / 60,
            color: '#8b5cf6'
          }))}
          valueFormatter={(v) => `${Math.round(v * 10) / 10}h`}
        />

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard
              title="Team Members"
              value={analytics.users.active}
              subtitle={`${analytics.users.total} total`}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Active Clients"
              value={analytics.companies.active}
              subtitle={`${analytics.companies.total} total`}
              icon={Building2}
              color="green"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StatCard
              title="Completed Projects"
              value={analytics.projects.completed}
              subtitle="Successfully delivered"
              icon={CheckSquare}
              color="green"
            />
            <StatCard
              title="On Hold Projects"
              value={analytics.projects.onHold}
              subtitle="Temporarily paused"
              icon={FolderKanban}
              color="orange"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
