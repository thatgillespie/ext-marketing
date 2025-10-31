import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Database from "better-sqlite3"
import path from "path"
import bcrypt from "bcryptjs"

const db = new Database(path.join(process.cwd(), "dev.db"))

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const active = searchParams.get("active")

    let query = `
      SELECT
        id, name, email, role, avatar, phone, department,
        jobTitle, hourlyRate, startDate, active, createdAt, updatedAt
      FROM users
      WHERE 1=1
    `
    const params: any[] = []

    if (role) {
      query += ` AND role = ?`
      params.push(role)
    }

    if (active !== null && active !== undefined) {
      query += ` AND active = ?`
      params.push(active === 'true' ? 1 : 0)
    }

    query += ` ORDER BY name ASC`

    const users = db.prepare(query).all(...params)

    // Convert SQLite boolean to actual boolean
    const formattedUsers = users.map((user: any) => ({
      ...(user as any),
      active: Boolean(user.active)
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
        { error: "Only admins can create users" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      password,
      role,
      phone,
      department,
      jobTitle,
      hourlyRate,
      startDate,
      active
    } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique ID
    const id = `u${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO users (
        id, name, email, password, role, phone, department,
        jobTitle, hourlyRate, startDate, active, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      name || null,
      email,
      hashedPassword,
      role || 'EMPLOYEE',
      phone || null,
      department || null,
      jobTitle || null,
      hourlyRate || null,
      startDate || null,
      active !== undefined ? (active ? 1 : 0) : 1,
      now,
      now
    )

    // Fetch created user (without password)
    const user = db.prepare(`
      SELECT
        id, name, email, role, avatar, phone, department,
        jobTitle, hourlyRate, startDate, active, createdAt, updatedAt
      FROM users WHERE id = ?
    `).get(id)

    return NextResponse.json({
      ...(user as any),
      active: Boolean((user as any).active)
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
