"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Download, Mail } from "lucide-react"
import { formatCurrency } from "@/lib/types/invoice"
import Link from "next/link"

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setInvoice(data)
        } else {
          router.push('/dashboard/invoices')
        }
      } catch (error) {
        console.error('Failed to fetch invoice:', error)
        router.push('/dashboard/invoices')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchInvoice()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading invoice...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-gray-500">{invoice.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Invoice Preview */}
      <Card>
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
              <p className="text-gray-600">{invoice.invoiceNumber}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[invoice.status]}`}>
                {invoice.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Your Agency Name</p>
              <p className="text-sm text-gray-600">123 Business Street</p>
              <p className="text-sm text-gray-600">City, State 12345</p>
              <p className="text-sm text-gray-600">contact@agency.com</p>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2">BILL TO</p>
              <p className="font-semibold">{invoice.companyName}</p>
              {invoice.projectName && (
                <p className="text-sm text-gray-600">Project: {invoice.projectName}</p>
              )}
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Issue Date:</span>
                <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                <span className="text-gray-500">Due Date:</span>
                <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {invoice.description && (
            <div className="mb-8">
              <p className="text-gray-700">{invoice.description}</p>
            </div>
          )}

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 font-semibold">Description</th>
                  <th className="text-right py-3 font-semibold w-24">Quantity</th>
                  <th className="text-right py-3 font-semibold w-32">Unit Price</th>
                  <th className="text-right py-3 font-semibold w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3">{item.description}</td>
                    <td className="text-right py-3">{item.quantity}</td>
                    <td className="text-right py-3">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right py-3 font-medium">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Tax (8%):</span>
                <span className="font-medium">{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-300">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Terms */}
          {invoice.terms && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
