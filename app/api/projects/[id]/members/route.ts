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
      const members = db.prepare(`
        SELECT pm.*, u.name, u.email, u.avatar
        FROM project_members pm
        JOIN users u ON pm.userId = u.id
        WHERE pm.projectId = ?
        ORDER BY pm.joinedAt ASC
      `).all(params.id)

      return NextResponse.json(members)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching project members:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { userId, role } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const db = getDb()
    const memberId = randomUUID()

    try {
      // Check if member already exists
      const existing = db.prepare(
        'SELECT id FROM project_members WHERE projectId = ? AND userId = ?'
      ).get(params.id, userId)

      if (existing) {
        return NextResponse.json(
          { error: "User is already a member of this project" },
          { status: 400 }
        )
      }

      db.prepare(`
        INSERT INTO project_members (id, projectId, userId, role, joinedAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        memberId,
        params.id,
        userId,
        role || null,
        Date.now()
      )

      const member = db.prepare(`
        SELECT pm.*, u.name, u.email
        FROM project_members pm
        JOIN users u ON pm.userId = u.id
        WHERE pm.id = ?
      `).get(memberId)

      return NextResponse.json(member, { status: 201 })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error adding project member:", error)
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const db = getDb()

    try {
      const result = db.prepare(
        'DELETE FROM project_members WHERE projectId = ? AND userId = ?'
      ).run(params.id, userId)

      if (result.changes === 0) {
        return NextResponse.json(
          { error: "Member not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: "Member removed successfully" })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error removing project member:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
