import { NextRequest, NextResponse } from "next/server"
import Database from "better-sqlite3"
import path from "path"

const db = new Database(path.join(process.cwd(), "dev.db"))

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const projectId = searchParams.get("projectId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const type = searchParams.get("type")

    let query = `
      SELECT
        ce.*,
        u.name as userName,
        p.name as projectName
      FROM calendar_events ce
      LEFT JOIN users u ON ce.userId = u.id
      LEFT JOIN projects p ON ce.projectId = p.id
      WHERE 1=1
    `
    const params: any[] = []

    if (userId) {
      query += ` AND ce.userId = ?`
      params.push(userId)
    }

    if (projectId) {
      query += ` AND ce.projectId = ?`
      params.push(projectId)
    }

    if (type) {
      query += ` AND ce.type = ?`
      params.push(type)
    }

    // Date range filter
    if (startDate && endDate) {
      query += ` AND ce.startTime >= ? AND ce.startTime <= ?`
      params.push(startDate, endDate)
    }

    query += ` ORDER BY ce.startTime ASC`

    const events = db.prepare(query).all(...params)

    // Convert SQLite boolean values (0/1) to actual booleans
    const formattedEvents = events.map((event: any) => ({
      ...(event as any),
      allDay: Boolean(event.allDay)
    }))

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error("Failed to fetch calendar events:", error)
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      startTime,
      endTime,
      allDay,
      location,
      color,
      type,
      userId,
      projectId
    } = body

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "title, startTime, and endTime are required" },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startTime)
    const end = new Date(endTime)
    if (end < start) {
      return NextResponse.json(
        { error: "endTime must be after startTime" },
        { status: 400 }
      )
    }

    // Generate unique ID
    const id = `e${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO calendar_events (
        id, title, description, startTime, endTime, allDay,
        location, color, type, userId, projectId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      title,
      description || null,
      startTime,
      endTime,
      allDay ? 1 : 0,
      location || null,
      color || null,
      type || 'MEETING',
      userId || null,
      projectId || null,
      now,
      now
    )

    // Fetch the created event with relations
    const event = db.prepare(`
      SELECT
        ce.*,
        u.name as userName,
        p.name as projectName
      FROM calendar_events ce
      LEFT JOIN users u ON ce.userId = u.id
      LEFT JOIN projects p ON ce.projectId = p.id
      WHERE ce.id = ?
    `).get(id)

    return NextResponse.json({
      ...(event as any),
      allDay: Boolean((event as any).allDay)
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create calendar event:", error)
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    )
  }
}
