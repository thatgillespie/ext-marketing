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
      name,
      description,
      companyId,
      status = "PLANNING",
      priority = "MEDIUM",
      startDate,
      endDate,
      budget,
      estimatedHours,
      color
    } = body

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      )
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "Company is required" },
        { status: 400 }
      )
    }

    const db = getDb()
    const projectId = randomUUID()
    const userId = (session.user as any)?.id

    try {
      // Verify company exists
      const company = db.prepare('SELECT id FROM companies WHERE id = ?').get(companyId)

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        )
      }

      db.prepare(`
        INSERT INTO projects (
          id, name, description, status, priority,
          startDate, endDate, budget, estimatedHours, color,
          companyId, createdById, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        projectId,
        name,
        description || null,
        status,
        priority,
        startDate ? new Date(startDate).getTime() : null,
        endDate ? new Date(endDate).getTime() : null,
        budget || null,
        estimatedHours || null,
        color || null,
        companyId,
        userId,
        Date.now(),
        Date.now()
      )

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId)

      return NextResponse.json(project, { status: 201 })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
