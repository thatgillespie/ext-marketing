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
      const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(params.id)

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(company)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching company:", error)
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
      const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(params.id)

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        )
      }

      const updateFields = []
      const updateValues = []

      const allowedFields = [
        'name', 'industry', 'website', 'phone', 'email',
        'address', 'city', 'state', 'zip', 'country', 'notes', 'status'
      ]

      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          updateFields.push(`${field} = ?`)
          updateValues.push(body[field])
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
        UPDATE companies
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `).run(...updateValues)

      const updatedCompany = db.prepare('SELECT * FROM companies WHERE id = ?').get(params.id)

      return NextResponse.json(updatedCompany)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error updating company:", error)
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
      const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(params.id)

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        )
      }

      db.prepare('DELETE FROM companies WHERE id = ?').run(params.id)

      return NextResponse.json({ message: "Company deleted successfully" })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error deleting company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
