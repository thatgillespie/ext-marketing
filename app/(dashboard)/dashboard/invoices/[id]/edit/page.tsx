"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { InvoiceForm } from "@/components/invoices/invoice-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditInvoicePage() {
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
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/invoices/${invoice.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Invoice</h1>
          <p className="text-gray-500">{invoice.invoiceNumber}</p>
        </div>
      </div>

      <InvoiceForm
        invoice={invoice}
        onSuccess={() => router.push(`/dashboard/invoices/${invoice.id}`)}
      />
    </div>
  )
}
