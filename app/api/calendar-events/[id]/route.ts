import { NextRequest, NextResponse } from "next/server"
import Database from "better-sqlite3"
import path from "path"

const db = new Database(path.join(process.cwd(), "dev.db"))

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = db.prepare(`
      SELECT
        ce.*,
        u.name as userName,
        p.name as projectName
      FROM calendar_events ce
      LEFT JOIN users u ON ce.userId = u.id
      LEFT JOIN projects p ON ce.projectId = p.id
      WHERE ce.id = ?
    `).get(params.id)

    if (!event) {
      return NextResponse.json(
        { error: "Calendar event not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...(event as any),
      allDay: Boolean((event as any).allDay)
    })
  } catch (error) {
    console.error("Failed to fetch calendar event:", error)
    return NextResponse.json(
      { error: "Failed to fetch calendar event" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if event exists
    const existing = db.prepare("SELECT * FROM calendar_events WHERE id = ?").get(params.id)
    if (!existing) {
      return NextResponse.json(
        { error: "Calendar event not found" },
        { status: 404 }
      )
    }

    // Validate dates if provided
    if (startTime && endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      if (end < start) {
        return NextResponse.json(
          { error: "endTime must be after startTime" },
          { status: 400 }
        )
      }
    }

    const now = new Date().toISOString()

    const stmt = db.prepare(`
      UPDATE calendar_events
      SET
        title = ?,
        description = ?,
        startTime = ?,
        endTime = ?,
        allDay = ?,
        location = ?,
        color = ?,
        type = ?,
        userId = ?,
        projectId = ?,
        updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(
      title !== undefined ? title : (existing as any).title,
      description !== undefined ? description : (existing as any).description,
      startTime !== undefined ? startTime : (existing as any).startTime,
      endTime !== undefined ? endTime : (existing as any).endTime,
      allDay !== undefined ? (allDay ? 1 : 0) : (existing as any).allDay,
      location !== undefined ? location : (existing as any).location,
      color !== undefined ? color : (existing as any).color,
      type !== undefined ? type : (existing as any).type,
      userId !== undefined ? userId : (existing as any).userId,
      projectId !== undefined ? projectId : (existing as any).projectId,
      now,
      params.id
    )

    // Fetch updated event
    const event = db.prepare(`
      SELECT
        ce.*,
        u.name as userName,
        p.name as projectName
      FROM calendar_events ce
      LEFT JOIN users u ON ce.userId = u.id
      LEFT JOIN projects p ON ce.projectId = p.id
      WHERE ce.id = ?
    `).get(params.id)

    return NextResponse.json({
      ...(event as any),
      allDay: Boolean((event as any).allDay)
    })
  } catch (error) {
    console.error("Failed to update calendar event:", error)
    return NextResponse.json(
      { error: "Failed to update calendar event" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = db.prepare("DELETE FROM calendar_events WHERE id = ?").run(params.id)

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Calendar event not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete calendar event:", error)
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    )
  }
}
