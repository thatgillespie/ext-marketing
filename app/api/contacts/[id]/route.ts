import { NextRequest, NextResponse } from "next/server"
import Database from "better-sqlite3"
import path from "path"

const db = new Database(path.join(process.cwd(), "dev.db"))

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = db.prepare(`
      SELECT
        c.*,
        co.name as companyName
      FROM contacts c
      LEFT JOIN companies co ON c.companyId = co.id
      WHERE c.id = ?
    `).get(params.id)

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Failed to fetch contact:", error)
    return NextResponse.json(
      { error: "Failed to fetch contact" },
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
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      isPrimary,
      notes,
      companyId
    } = body

    // Check if contact exists
    const existing = db.prepare("SELECT * FROM contacts WHERE id = ?").get(params.id)
    if (!existing) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      )
    }

    // If this contact is being set as primary, unset other primary contacts
    if (isPrimary) {
      const targetCompanyId = companyId || (existing as any).companyId
      db.prepare(`
        UPDATE contacts
        SET isPrimary = 0
        WHERE companyId = ? AND id != ?
      `).run(targetCompanyId, params.id)
    }

    const now = new Date().toISOString()

    const stmt = db.prepare(`
      UPDATE contacts
      SET
        firstName = ?,
        lastName = ?,
        email = ?,
        phone = ?,
        jobTitle = ?,
        isPrimary = ?,
        notes = ?,
        companyId = ?,
        updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(
      firstName !== undefined ? firstName : (existing as any).firstName,
      lastName !== undefined ? lastName : (existing as any).lastName,
      email !== undefined ? email : (existing as any).email,
      phone !== undefined ? phone : (existing as any).phone,
      jobTitle !== undefined ? jobTitle : (existing as any).jobTitle,
      isPrimary !== undefined ? (isPrimary ? 1 : 0) : (existing as any).isPrimary,
      notes !== undefined ? notes : (existing as any).notes,
      companyId !== undefined ? companyId : (existing as any).companyId,
      now,
      params.id
    )

    // Fetch updated contact
    const contact = db.prepare(`
      SELECT
        c.*,
        co.name as companyName
      FROM contacts c
      LEFT JOIN companies co ON c.companyId = co.id
      WHERE c.id = ?
    `).get(params.id)

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Failed to update contact:", error)
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = db.prepare("DELETE FROM contacts WHERE id = ?").run(params.id)

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete contact:", error)
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    )
  }
}
