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
    const companyId = searchParams.get('companyId')
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    const db = getDb()

    try {
      let query = `
        SELECT pr.*, c.name as companyName, p.name as projectName,
               u.name as createdByName
        FROM proposals pr
        LEFT JOIN companies c ON pr.companyId = c.id
        LEFT JOIN projects p ON pr.projectId = p.id
        LEFT JOIN users u ON pr.createdById = u.id
        WHERE 1=1
      `
      const params: any[] = []

      if (companyId) {
        query += ' AND pr.companyId = ?'
        params.push(companyId)
      }

      if (projectId) {
        query += ' AND pr.projectId = ?'
        params.push(projectId)
      }

      if (status) {
        query += ' AND pr.status = ?'
        params.push(status)
      }

      query += ' ORDER BY pr.createdAt DESC'

      const proposals = db.prepare(query).all(...params)
      return NextResponse.json(proposals)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching proposals:", error)
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
      proposalNumber,
      title,
      description,
      companyId,
      projectId,
      validUntil,
      items,
      notes,
      terms,
      status = "DRAFT"
    } = body

    if (!proposalNumber || !title || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Proposal must have at least one item" },
        { status: 400 }
      )
    }

    const db = getDb()
    const proposalId = randomUUID()
    const userId = (session.user as any)?.id

    try {
      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) =>
        sum + (item.quantity * item.unitPrice), 0
      )
      const tax = subtotal * 0.08 // 8% tax
      const total = subtotal + tax

      // Create proposal
      db.prepare(`
        INSERT INTO proposals (
          id, proposalNumber, title, description, status,
          validUntil, subtotal, tax, total, notes, terms,
          companyId, projectId, createdById, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        proposalId,
        proposalNumber,
        title,
        description || null,
        status,
        validUntil ? new Date(validUntil).getTime() : null,
        subtotal,
        tax,
        total,
        notes || null,
        terms || null,
        companyId,
        projectId || null,
        userId,
        Date.now(),
        Date.now()
      )

      // Create proposal items
      items.forEach((item: any, index: number) => {
        const itemId = randomUUID()
        const itemTotal = item.quantity * item.unitPrice

        db.prepare(`
          INSERT INTO proposal_items (
            id, description, quantity, unitPrice, total, "order",
            proposalId, productId, createdAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          itemId,
          item.description,
          item.quantity,
          item.unitPrice,
          itemTotal,
          index,
          proposalId,
          item.productId || null,
          Date.now()
        )
      })

      // Fetch complete proposal
      const proposal = db.prepare(`
        SELECT pr.*, c.name as companyName
        FROM proposals pr
        LEFT JOIN companies c ON pr.companyId = c.id
        WHERE pr.id = ?
      `).get(proposalId)

      const proposalItems = db.prepare(
        'SELECT * FROM proposal_items WHERE proposalId = ? ORDER BY "order"'
      ).all(proposalId)

      return NextResponse.json({ ...proposal, items: proposalItems }, { status: 201 })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error creating proposal:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
