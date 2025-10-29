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

export async function GET() {
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
      const companies = db.prepare('SELECT * FROM companies ORDER BY name ASC').all()
      return NextResponse.json(companies)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching companies:", error)
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
      name,
      industry,
      website,
      phone,
      email,
      address,
      city,
      state,
      zip,
      country,
      notes,
      status = "ACTIVE"
    } = body

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      )
    }

    const db = getDb()
    const companyId = randomUUID()

    try {
      db.prepare(`
        INSERT INTO companies (
          id, name, industry, website, phone, email,
          address, city, state, zip, country, notes, status,
          createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        companyId,
        name,
        industry || null,
        website || null,
        phone || null,
        email || null,
        address || null,
        city || null,
        state || null,
        zip || null,
        country || null,
        notes || null,
        status,
        Date.now(),
        Date.now()
      )

      const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId)

      return NextResponse.json(company, { status: 201 })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
