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
      const task = db.prepare(`
        SELECT t.*,
               u.name as assignedToName,
               p.name as projectName
        FROM tasks t
        LEFT JOIN users u ON t.assignedToId = u.id
        LEFT JOIN projects p ON t.projectId = p.id
        WHERE t.id = ?
      `).get(params.id)

      if (!task) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        )
      }

      // Get subtasks
      const subtasks = db.prepare('SELECT * FROM subtasks WHERE taskId = ? ORDER BY "order" ASC').all(params.id)

      return NextResponse.json({ ...task, subtasks })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching task:", error)
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
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(params.id)

      if (!task) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        )
      }

      const updateFields = []
      const updateValues = []

      const allowedFields = [
        'title', 'description', 'status', 'priority',
        'startDate', 'dueDate', 'estimatedHours', 'actualHours',
        'assignedToId', 'order'
      ]

      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          if (field === 'startDate' || field === 'dueDate') {
            updateFields.push(`${field} = ?`)
            updateValues.push(body[field] ? new Date(body[field]).getTime() : null)
          } else {
            updateFields.push(`${field} = ?`)
            updateValues.push(body[field])
          }
        }
      })

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
        UPDATE tasks
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `).run(...updateValues)

      const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(params.id)

      return NextResponse.json(updatedTask)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error updating task:", error)
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
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(params.id)

      if (!task) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        )
      }

      db.prepare('DELETE FROM tasks WHERE id = ?').run(params.id)

      return NextResponse.json({ message: "Task deleted successfully" })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
