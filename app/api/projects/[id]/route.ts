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
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(params.id)

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(project)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching project:", error)
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
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(params.id)

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        )
      }

      const updateFields = []
      const updateValues = []

      const allowedFields = [
        'name', 'description', 'status', 'priority',
        'startDate', 'endDate', 'budget', 'estimatedHours', 'color', 'companyId'
      ]

      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          if (field === 'startDate' || field === 'endDate') {
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
        UPDATE projects
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `).run(...updateValues)

      const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(params.id)

      return NextResponse.json(updatedProject)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error updating project:", error)
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
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(params.id)

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        )
      }

      db.prepare('DELETE FROM projects WHERE id = ?').run(params.id)

      return NextResponse.json({ message: "Project deleted successfully" })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
