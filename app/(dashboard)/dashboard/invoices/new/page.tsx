"use client"

import { InvoiceForm } from "@/components/invoices/invoice-form"

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Invoice</h1>
        <p className="text-gray-500">Create a new invoice for a client</p>
      </div>

      <InvoiceForm />
    </div>
  )
}
