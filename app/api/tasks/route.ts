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

    const db = getDb()

    try {
      let query = 'SELECT * FROM tasks'
      let params: any[] = []

      if (projectId) {
        query += ' WHERE projectId = ?'
        params.push(projectId)
      }

      query += ' ORDER BY "order" ASC, createdAt DESC'

      const tasks = db.prepare(query).all(...params)
      return NextResponse.json(tasks)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching tasks:", error)
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
      title,
      description,
      projectId,
      assignedToId,
      status = "TODO",
      priority = "MEDIUM",
      startDate,
      dueDate,
      estimatedHours,
      order = 0
    } = body

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      )
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project is required" },
        { status: 400 }
      )
    }

    const db = getDb()
    const taskId = randomUUID()
    const userId = (session.user as any)?.id

    try {
      // Verify project exists
      const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId)

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        )
      }

      db.prepare(`
        INSERT INTO tasks (
          id, title, description, status, priority,
          startDate, dueDate, estimatedHours, "order",
          projectId, assignedToId, createdById, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        taskId,
        title,
        description || null,
        status,
        priority,
        startDate ? new Date(startDate).getTime() : null,
        dueDate ? new Date(dueDate).getTime() : null,
        estimatedHours || null,
        order,
        projectId,
        assignedToId || null,
        userId,
        Date.now(),
        Date.now()
      )

      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId)

      return NextResponse.json(task, { status: 201 })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
