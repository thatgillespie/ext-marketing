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
      const proposal = db.prepare(`
        SELECT pr.*, c.name as companyName, c.address, c.city, c.state, c.zip,
               c.email as companyEmail, c.phone as companyPhone,
               p.name as projectName, u.name as createdByName
        FROM proposals pr
        LEFT JOIN companies c ON pr.companyId = c.id
        LEFT JOIN projects p ON pr.projectId = p.id
        LEFT JOIN users u ON pr.createdById = u.id
        WHERE pr.id = ?
      `).get(params.id)

      if (!proposal) {
        return NextResponse.json(
          { error: "Proposal not found" },
          { status: 404 }
        )
      }

      const items = db.prepare(
        'SELECT * FROM proposal_items WHERE proposalId = ? ORDER BY "order"'
      ).all(params.id)

      return NextResponse.json({ ...proposal, items })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error fetching proposal:", error)
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
      const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(params.id)

      if (!proposal) {
        return NextResponse.json(
          { error: "Proposal not found" },
          { status: 404 }
        )
      }

      const updateFields = []
      const updateValues = []

      const allowedFields = [
        'title', 'description', 'status', 'validUntil',
        'sentAt', 'acceptedAt', 'notes', 'terms'
      ]

      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          if (field === 'validUntil' || field === 'sentAt' || field === 'acceptedAt') {
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
        db.prepare('DELETE FROM proposal_items WHERE proposalId = ?').run(params.id)

        // Create new items
        body.items.forEach((item: any, index: number) => {
          const itemId = require('crypto').randomUUID()
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
            params.id,
            item.productId || null,
            Date.now()
          )
        })
      }

      // Auto-update sentAt when status changes to SENT
      if (body.status === 'SENT' && !(proposal as any).sentAt) {
        updateFields.push('sentAt = ?')
        updateValues.push(Date.now())
      }

      // Auto-update acceptedAt when status changes to ACCEPTED
      if (body.status === 'ACCEPTED' && !(proposal as any).acceptedAt) {
        updateFields.push('acceptedAt = ?')
        updateValues.push(Date.now())
      }

      if (updateFields.length > 0) {
        updateFields.push('updatedAt = ?')
        updateValues.push(Date.now())
        updateValues.push(params.id)

        db.prepare(`
          UPDATE proposals
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `).run(...updateValues)
      }

      // Fetch updated proposal
      const updatedProposal = db.prepare(`
        SELECT pr.*, c.name as companyName
        FROM proposals pr
        LEFT JOIN companies c ON pr.companyId = c.id
        WHERE pr.id = ?
      `).get(params.id)

      const items = db.prepare(
        'SELECT * FROM proposal_items WHERE proposalId = ? ORDER BY "order"'
      ).all(params.id)

      return NextResponse.json({ ...updatedProposal, items })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error updating proposal:", error)
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
      const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(params.id)

      if (!proposal) {
        return NextResponse.json(
          { error: "Proposal not found" },
          { status: 404 }
        )
      }

      // Delete proposal items first
      db.prepare('DELETE FROM proposal_items WHERE proposalId = ?').run(params.id)

      // Delete proposal
      db.prepare('DELETE FROM proposals WHERE id = ?').run(params.id)

      return NextResponse.json({ message: "Proposal deleted successfully" })
    } finally {
      db.close()
    }
  } catch (error) {
    console.error("Error deleting proposal:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
