import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Database from "better-sqlite3"
import path from "path"
import { randomUUID } from "crypto"

const getDb = () => {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  return new Database(dbPath)
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const db = getDb()

    try {
      let query = `
        SELECT te.*, u.name as userName, t.title as taskTitle, p.name as projectName
        FROM time_entries te
        LEFT JOIN users u ON te.userId = u.id
        LEFT JOIN tasks t ON te.taskId = t.id
        LEFT JOIN projects p ON te.projectId = p.id
        WHERE 1=1
      `
      const params: any[] = []

      if (projectId) {
        query += ' AND te.projectId = ?'
        params.push(projectId)
      }

      if (userId) {
        query += ' AND te.userId = ?'
        params.push(userId)
      }

      if (startDate) {
        query += ' AND te.startTime >= ?'
        params.push(new Date(startDate).getTime())
      }

      if (endDate) {
        query += ' AND te.startTime <= ?'
        params.push(new Date(endDate).getTime())
      }

      query += ' ORDER BY te.startTime DESC'

      const entries = db.prepare(query).all(...params)
      return NextResponse.json(entries)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching time entries:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      description,
      projectId,
      taskId,
      startTime,
      endTime,
      billable = true
    } = body

    if (!projectId) {
      return NextResponse.json(
        { error: "Project is required" },
        { status: 400 }
      )
    }

    if (!startTime) {
      return NextResponse.json(
        { error: "Start time is required" },
        { status: 400 }
      )
    }

    const db = getDb()
    const entryId = randomUUID()
    const userId = (session.user as any)?.id

    try {
      // Calculate duration if endTime is provided
      let duration = null
      if (endTime) {
        const start = new Date(startTime).getTime()
        const end = new Date(endTime).getTime()
        duration = Math.round((end - start) / 60000) // Duration in minutes
      }

      db.prepare(`
        INSERT INTO time_entries (
          id, description, startTime, endTime, duration, billable,
          userId, taskId, projectId, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        entryId,
        description || null,
        new Date(startTime).getTime(),
        endTime ? new Date(endTime).getTime() : null,
        duration,
        billable ? 1 : 0,
        userId,
        taskId || null,
        projectId,
        Date.now(),
        Date.now()
      )

      const entry = db.prepare(`
        SELECT te.*, u.name as userName, t.title as taskTitle, p.name as projectName
        FROM time_entries te
        LEFT JOIN users u ON te.userId = u.id
        LEFT JOIN tasks t ON te.taskId = t.id
        LEFT JOIN projects p ON te.projectId = p.id
        WHERE te.id = ?
      `).get(entryId)

      return NextResponse.json(entry, { status: 201 })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error creating time entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
