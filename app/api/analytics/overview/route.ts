import { NextRequest, NextResponse } from "next/server"
import Database from "better-sqlite3"
import path from "path"

const db = new Database(path.join(process.cwd(), "dev.db"))

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Default to last 30 days if no dates provided
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const end = endDate || new Date().toISOString()

    // Time tracking stats
    const timeStats = db.prepare(`
      SELECT
        COUNT(*) as totalEntries,
        SUM(duration) as totalMinutes,
        SUM(CASE WHEN billable = 1 THEN duration ELSE 0 END) as billableMinutes,
        SUM(CASE WHEN billable = 0 THEN duration ELSE 0 END) as nonBillableMinutes
      FROM time_entries
      WHERE startTime >= ? AND startTime <= ?
    `).get(start, end) as any

    // Project stats
    const projectStats = db.prepare(`
      SELECT
        COUNT(*) as totalProjects,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedProjects,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as activeProjects,
        SUM(CASE WHEN status = 'ON_HOLD' THEN 1 ELSE 0 END) as onHoldProjects,
        SUM(budget) as totalBudget,
        SUM(estimatedHours) as totalEstimatedHours
      FROM projects
      WHERE createdAt >= ? AND createdAt <= ?
    `).get(start, end) as any

    // Invoice stats
    const invoiceStats = db.prepare(`
      SELECT
        COUNT(*) as totalInvoices,
        SUM(total) as totalRevenue,
        SUM(CASE WHEN status = 'PAID' THEN total ELSE 0 END) as paidRevenue,
        SUM(CASE WHEN status = 'SENT' THEN total ELSE 0 END) as pendingRevenue,
        SUM(CASE WHEN status = 'OVERDUE' THEN total ELSE 0 END) as overdueRevenue
      FROM invoices
      WHERE issueDate >= ? AND issueDate <= ?
    `).get(start, end) as any

    // Task stats
    const taskStats = db.prepare(`
      SELECT
        COUNT(*) as totalTasks,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedTasks,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressTasks,
        SUM(CASE WHEN status = 'TODO' THEN 1 ELSE 0 END) as todoTasks
      FROM tasks
      WHERE createdAt >= ? AND createdAt <= ?
    `).get(start, end) as any

    // User activity stats
    const userStats = db.prepare(`
      SELECT COUNT(*) as totalUsers, SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as activeUsers
      FROM users
    `).get() as any

    // Company stats
    const companyStats = db.prepare(`
      SELECT
        COUNT(*) as totalCompanies,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as activeCompanies
      FROM companies
    `).get() as any

    // Time by project
    const timeByProject = db.prepare(`
      SELECT
        p.id,
        p.name,
        SUM(te.duration) as totalMinutes
      FROM time_entries te
      JOIN projects p ON te.projectId = p.id
      WHERE te.startTime >= ? AND te.startTime <= ?
      GROUP BY p.id, p.name
      ORDER BY totalMinutes DESC
      LIMIT 10
    `).all(start, end)

    // Time by user
    const timeByUser = db.prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        SUM(te.duration) as totalMinutes,
        SUM(CASE WHEN te.billable = 1 THEN te.duration ELSE 0 END) as billableMinutes
      FROM time_entries te
      JOIN users u ON te.userId = u.id
      WHERE te.startTime >= ? AND te.startTime <= ?
      GROUP BY u.id, u.name, u.email
      ORDER BY totalMinutes DESC
      LIMIT 10
    `).all(start, end)

    // Revenue by month (last 6 months)
    const revenueByMonth = db.prepare(`
      SELECT
        strftime('%Y-%m', issueDate) as month,
        SUM(total) as revenue,
        SUM(CASE WHEN status = 'PAID' THEN total ELSE 0 END) as paidRevenue
      FROM invoices
      WHERE issueDate >= date('now', '-6 months')
      GROUP BY month
      ORDER BY month DESC
    `).all()

    return NextResponse.json({
      dateRange: { start, end },
      timeTracking: {
        totalEntries: timeStats.totalEntries || 0,
        totalHours: Math.round((timeStats.totalMinutes || 0) / 60 * 10) / 10,
        billableHours: Math.round((timeStats.billableMinutes || 0) / 60 * 10) / 10,
        nonBillableHours: Math.round((timeStats.nonBillableMinutes || 0) / 60 * 10) / 10,
      },
      projects: {
        total: projectStats.totalProjects || 0,
        completed: projectStats.completedProjects || 0,
        active: projectStats.activeProjects || 0,
        onHold: projectStats.onHoldProjects || 0,
        totalBudget: projectStats.totalBudget || 0,
        estimatedHours: projectStats.totalEstimatedHours || 0,
      },
      invoices: {
        total: invoiceStats.totalInvoices || 0,
        totalRevenue: invoiceStats.totalRevenue || 0,
        paidRevenue: invoiceStats.paidRevenue || 0,
        pendingRevenue: invoiceStats.pendingRevenue || 0,
        overdueRevenue: invoiceStats.overdueRevenue || 0,
      },
      tasks: {
        total: taskStats.totalTasks || 0,
        completed: taskStats.completedTasks || 0,
        inProgress: taskStats.inProgressTasks || 0,
        todo: taskStats.todoTasks || 0,
        completionRate: taskStats.totalTasks ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100) : 0,
      },
      users: {
        total: userStats.totalUsers || 0,
        active: userStats.activeUsers || 0,
      },
      companies: {
        total: companyStats.totalCompanies || 0,
        active: companyStats.activeCompanies || 0,
      },
      timeByProject,
      timeByUser,
      revenueByMonth,
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
