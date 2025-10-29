import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Database from "better-sqlite3"
import path from "path"

const getDb = () => {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  return new Database(dbPath)
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const db = getDb()

    try {
      const entry = db.prepare(`
        SELECT te.*, u.name as userName, t.title as taskTitle, p.name as projectName
        FROM time_entries te
        LEFT JOIN users u ON te.userId = u.id
        LEFT JOIN tasks t ON te.taskId = t.id
        LEFT JOIN projects p ON te.projectId = p.id
        WHERE te.id = ?
      `).get(params.id)

      if (!entry) {
        return NextResponse.json(
          { error: "Time entry not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(entry)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching time entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const db = getDb()

    try {
      const entry = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(params.id)

      if (!entry) {
        return NextResponse.json(
          { error: "Time entry not found" },
          { status: 404 }
        )
      }

      const updateFields = []
      const updateValues = []

      const allowedFields = [
        'description', 'startTime', 'endTime', 'billable', 'taskId'
      ]

      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          if (field === 'startTime' || field === 'endTime') {
            updateFields.push(`${field} = ?`)
            updateValues.push(body[field] ? new Date(body[field]).getTime() : null)
          } else if (field === 'billable') {
            updateFields.push(`${field} = ?`)
            updateValues.push(body[field] ? 1 : 0)
          } else {
            updateFields.push(`${field} = ?`)
            updateValues.push(body[field])
          }
        }
      })

      // Recalculate duration if times changed
      if (body.startTime !== undefined || body.endTime !== undefined) {
        const startTime = body.startTime !== undefined
          ? new Date(body.startTime).getTime()
          : (entry as any).startTime
        const endTime = body.endTime !== undefined
          ? (body.endTime ? new Date(body.endTime).getTime() : null)
          : (entry as any).endTime

        if (startTime && endTime) {
          const duration = Math.round((endTime - startTime) / 60000)
          updateFields.push('duration = ?')
          updateValues.push(duration)
        }
      }

      if (updateFields.length === 0) {
        return NextResponse.json(
          { error: "No fields to update" },
          { status: 400 }
        )
      }

      updateFields.push('updatedAt = ?')
      updateValues.push(Date.now())
      updateValues.push(params.id)

      db.prepare(`
        UPDATE time_entries
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `).run(...updateValues)

      const updatedEntry = db.prepare(`
        SELECT te.*, u.name as userName, t.title as taskTitle, p.name as projectName
        FROM time_entries te
        LEFT JOIN users u ON te.userId = u.id
        LEFT JOIN tasks t ON te.taskId = t.id
        LEFT JOIN projects p ON te.projectId = p.id
        WHERE te.id = ?
      `).get(params.id)

      return NextResponse.json(updatedEntry)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error updating time entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const db = getDb()

    try {
      const entry = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(params.id)

      if (!entry) {
        return NextResponse.json(
          { error: "Time entry not found" },
          { status: 404 }
        )
      }

      db.prepare('DELETE FROM time_entries WHERE id = ?').run(params.id)

      return NextResponse.json({ message: "Time entry deleted successfully" })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error deleting time entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
