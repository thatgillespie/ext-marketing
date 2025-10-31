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
      const invoice = db.prepare(`
        SELECT i.*, c.name as companyName, c.address, c.city, c.state, c.zip,
               c.email as companyEmail, c.phone as companyPhone,
               p.name as projectName, u.name as createdByName
        FROM invoices i
        LEFT JOIN companies c ON i.companyId = c.id
        LEFT JOIN projects p ON i.projectId = p.id
        LEFT JOIN users u ON i.createdById = u.id
        WHERE i.id = ?
      `).get(params.id)

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        )
      }

      const items = db.prepare(
        'SELECT * FROM invoice_items WHERE invoiceId = ? ORDER BY "order"'
      ).all(params.id)

      return NextResponse.json({ ...(invoice as any), items })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching invoice:", error)
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
      const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(params.id)

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        )
      }

      const updateFields = []
      const updateValues = []

      const allowedFields = [
        'title', 'description', 'status', 'issueDate', 'dueDate',
        'paidDate', 'notes', 'terms'
      ]

      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          if (field === 'issueDate' || field === 'dueDate' || field === 'paidDate') {
            updateFields.push(`${field} = ?`)
            updateValues.push(body[field] ? new Date(body[field]).getTime() : null)
          } else {
            updateFields.push(`${field} = ?`)
            updateValues.push(body[field])
          }
        }
      })

      // If items are being updated, recalculate totals
      if (body.items) {
        const subtotal = body.items.reduce((sum: number, item: any) =>
          sum + (item.quantity * item.unitPrice), 0
        )
        const tax = subtotal * 0.08
        const total = subtotal + tax

        updateFields.push('subtotal = ?', 'tax = ?', 'total = ?')
        updateValues.push(subtotal, tax, total)

        // Delete existing items
        db.prepare('DELETE FROM invoice_items WHERE invoiceId = ?').run(params.id)

        // Create new items
        body.items.forEach((item: any, index: number) => {
          const itemId = require('crypto').randomUUID()
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
            params.id,
            item.productId || null,
            Date.now()
          )
        })
      }

      if (updateFields.length > 0) {
        updateFields.push('updatedAt = ?')
        updateValues.push(Date.now())
        updateValues.push(params.id)

        db.prepare(`
          UPDATE invoices
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `).run(...updateValues)
      }

      // Fetch updated invoice
      const updatedInvoice = db.prepare(`
        SELECT i.*, c.name as companyName
        FROM invoices i
        LEFT JOIN companies c ON i.companyId = c.id
        WHERE i.id = ?
      `).get(params.id)

      const items = db.prepare(
        'SELECT * FROM invoice_items WHERE invoiceId = ? ORDER BY "order"'
      ).all(params.id)

      return NextResponse.json({ ...(updatedInvoice as any), items })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error updating invoice:", error)
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
      const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(params.id)

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        )
      }

      // Delete invoice items first
      db.prepare('DELETE FROM invoice_items WHERE invoiceId = ?').run(params.id)

      // Delete invoice
      db.prepare('DELETE FROM invoices WHERE id = ?').run(params.id)

      return NextResponse.json({ message: "Invoice deleted successfully" })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
