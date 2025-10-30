import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Database from "better-sqlite3"
import path from "path"
import bcrypt from "bcryptjs"

const db = new Database(path.join(process.cwd(), "dev.db"))

export async function GET(
  request: NextRequest,
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

    const user = db.prepare(`
      SELECT
        id, name, email, role, avatar, phone, department,
        jobTitle, hourlyRate, startDate, active, createdAt, updatedAt
      FROM users WHERE id = ?
    `).get(params.id)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...user,
      active: Boolean((user as any).active)
    })
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
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

    const currentUserEmail = (session.user as any).email
    const currentUser = db.prepare('SELECT id, role FROM users WHERE email = ?').get(currentUserEmail) as any

    // Check permissions: users can update themselves, admins can update anyone
    if (currentUser.id !== params.id && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      password,
      role,
      avatar,
      phone,
      department,
      jobTitle,
      hourlyRate,
      startDate,
      active
    } = body

    // Check if user exists
    const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(params.id) as any
    if (!existing) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Only admins can change roles
    if (role && role !== existing.role && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Only admins can change user roles" },
        { status: 403 }
      )
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existing.email) {
      const emailTaken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, params.id)
      if (emailTaken) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        )
      }
    }

    const now = new Date().toISOString()
    let hashedPassword = existing.password

    // Hash new password if provided
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const stmt = db.prepare(`
      UPDATE users
      SET
        name = ?,
        email = ?,
        password = ?,
        role = ?,
        avatar = ?,
        phone = ?,
        department = ?,
        jobTitle = ?,
        hourlyRate = ?,
        startDate = ?,
        active = ?,
        updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(
      name !== undefined ? name : existing.name,
      email !== undefined ? email : existing.email,
      hashedPassword,
      role !== undefined ? role : existing.role,
      avatar !== undefined ? avatar : existing.avatar,
      phone !== undefined ? phone : existing.phone,
      department !== undefined ? department : existing.department,
      jobTitle !== undefined ? jobTitle : existing.jobTitle,
      hourlyRate !== undefined ? hourlyRate : existing.hourlyRate,
      startDate !== undefined ? startDate : existing.startDate,
      active !== undefined ? (active ? 1 : 0) : existing.active,
      now,
      params.id
    )

    // Fetch updated user
    const user = db.prepare(`
      SELECT
        id, name, email, role, avatar, phone, department,
        jobTitle, hourlyRate, startDate, active, createdAt, updatedAt
      FROM users WHERE id = ?
    `).get(params.id)

    return NextResponse.json({
      ...user,
      active: Boolean((user as any).active)
    })
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
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

    // Check if user is admin
    const currentUser = db.prepare('SELECT role FROM users WHERE email = ?').get((session.user as any).email) as any
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Only admins can delete users" },
        { status: 403 }
      )
    }

    // Soft delete: set active to false instead of actually deleting
    const result = db.prepare("UPDATE users SET active = 0, updatedAt = ? WHERE id = ?")
      .run(new Date().toISOString(), params.id)

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
