import { NextRequest, NextResponse } from "next/server"
import Database from "better-sqlite3"
import path from "path"

const db = new Database(path.join(process.cwd(), "dev.db"))

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")
    const search = searchParams.get("search")

    let query = `
      SELECT
        c.*,
        co.name as companyName
      FROM contacts c
      LEFT JOIN companies co ON c.companyId = co.id
      WHERE 1=1
    `
    const params: any[] = []

    if (companyId) {
      query += ` AND c.companyId = ?`
      params.push(companyId)
    }

    if (search) {
      query += ` AND (c.firstName LIKE ? OR c.lastName LIKE ? OR c.email LIKE ? OR c.jobTitle LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    query += ` ORDER BY c.isPrimary DESC, c.lastName, c.firstName`

    const contacts = db.prepare(query).all(...params)

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Failed to fetch contacts:", error)
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      isPrimary,
      notes,
      companyId
    } = body

    if (!firstName || !lastName || !companyId) {
      return NextResponse.json(
        { error: "firstName, lastName, and companyId are required" },
        { status: 400 }
      )
    }

    // Generate unique ID
    const id = `c${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    // If this contact is set as primary, unset other primary contacts for this company
    if (isPrimary) {
      db.prepare(`
        UPDATE contacts
        SET isPrimary = 0
        WHERE companyId = ?
      `).run(companyId)
    }

    const stmt = db.prepare(`
      INSERT INTO contacts (
        id, firstName, lastName, email, phone, jobTitle,
        isPrimary, notes, companyId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      firstName,
      lastName,
      email || null,
      phone || null,
      jobTitle || null,
      isPrimary ? 1 : 0,
      notes || null,
      companyId,
      now,
      now
    )

    // Fetch the created contact with company name
    const contact = db.prepare(`
      SELECT
        c.*,
        co.name as companyName
      FROM contacts c
      LEFT JOIN companies co ON c.companyId = co.id
      WHERE c.id = ?
    `).get(id)

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("Failed to create contact:", error)
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    )
  }
}
