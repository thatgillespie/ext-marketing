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
        SELECT i.*, c.name as companyName, p.name as projectName,
               u.name as createdByName
        FROM invoices i
        LEFT JOIN companies c ON i.companyId = c.id
        LEFT JOIN projects p ON i.projectId = p.id
        LEFT JOIN users u ON i.createdById = u.id
        WHERE 1=1
      `
      const params: any[] = []

      if (companyId) {
        query += ' AND i.companyId = ?'
        params.push(companyId)
      }

      if (projectId) {
        query += ' AND i.projectId = ?'
        params.push(projectId)
      }

      if (status) {
        query += ' AND i.status = ?'
        params.push(status)
      }

      query += ' ORDER BY i.createdAt DESC'

      const invoices = db.prepare(query).all(...params)
      return NextResponse.json(invoices)
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching invoices:", error)
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
      invoiceNumber,
      title,
      description,
      companyId,
      projectId,
      issueDate,
      dueDate,
      items,
      notes,
      terms,
      status = "DRAFT"
    } = body

    if (!invoiceNumber || !title || !companyId || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Invoice must have at least one item" },
        { status: 400 }
      )
    }

    const db = getDb()
    const invoiceId = randomUUID()
    const userId = (session.user as any)?.id

    try {
      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) =>
        sum + (item.quantity * item.unitPrice), 0
      )
      const tax = subtotal * 0.08 // 8% tax, make this configurable
      const total = subtotal + tax

      // Create invoice
      db.prepare(`
        INSERT INTO invoices (
          id, invoiceNumber, title, description, status,
          issueDate, dueDate, subtotal, tax, total, notes, terms,
          companyId, projectId, createdById, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        invoiceId,
        invoiceNumber,
        title,
        description || null,
        status,
        issueDate ? new Date(issueDate).getTime() : Date.now(),
        new Date(dueDate).getTime(),
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

      // Create invoice items
      items.forEach((item: any, index: number) => {
        const itemId = randomUUID()
        const itemTotal = item.quantity * item.unitPrice

        db.prepare(`
          INSERT INTO invoice_items (
            id, description, quantity, unitPrice, total, "order",
            invoiceId, productId, createdAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          itemId,
          item.description,
          item.quantity,
          item.unitPrice,
          itemTotal,
          index,
          invoiceId,
          item.productId || null,
          Date.now()
        )
      })

      // Fetch complete invoice
      const invoice = db.prepare(`
        SELECT i.*, c.name as companyName
        FROM invoices i
        LEFT JOIN companies c ON i.companyId = c.id
        WHERE i.id = ?
      `).get(invoiceId)

      const invoiceItems = db.prepare(
        'SELECT * FROM invoice_items WHERE invoiceId = ? ORDER BY "order"'
      ).all(invoiceId)

      return NextResponse.json({ ...invoice, items: invoiceItems }, { status: 201 })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
