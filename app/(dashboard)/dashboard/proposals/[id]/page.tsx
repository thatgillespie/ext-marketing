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
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
}

export default function ProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await fetch(`/api/proposals/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProposal(data)
        } else {
          router.push('/dashboard/proposals')
        }
      } catch (error) {
        console.error('Failed to fetch proposal:', error)
        router.push('/dashboard/proposals')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProposal()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading proposal...</p>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Proposal not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/proposals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{proposal.proposalNumber}</h1>
            <p className="text-gray-500">{proposal.title}</p>
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
          <Link href={`/dashboard/proposals/${proposal.id}/edit`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Proposal Preview */}
      <Card>
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">PROPOSAL</h2>
              <p className="text-gray-600">{proposal.proposalNumber}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[proposal.status]}`}>
                {proposal.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Your Agency Name</p>
              <p className="text-sm text-gray-600">123 Business Street</p>
              <p className="text-sm text-gray-600">City, State 12345</p>
              <p className="text-sm text-gray-600">contact@agency.com</p>
            </div>
          </div>

          {/* Prepared For Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2">PREPARED FOR</p>
              <p className="font-semibold">{proposal.companyName}</p>
              {proposal.projectName && (
                <p className="text-sm text-gray-600">Project: {proposal.projectName}</p>
              )}
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Issue Date:</span>
                <span>{new Date(proposal.issueDate).toLocaleDateString()}</span>
                <span className="text-gray-500">Valid Until:</span>
                <span>{new Date(proposal.validUntil).toLocaleDateString()}</span>
                {proposal.sentAt && (
                  <>
                    <span className="text-gray-500">Sent At:</span>
                    <span>{new Date(proposal.sentAt).toLocaleDateString()}</span>
                  </>
                )}
                {proposal.acceptedAt && (
                  <>
                    <span className="text-gray-500">Accepted At:</span>
                    <span>{new Date(proposal.acceptedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {proposal.description && (
            <div className="mb-8">
              <p className="text-gray-700">{proposal.description}</p>
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
                {proposal.items?.map((item: any, index: number) => (
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
                <span className="font-medium">{formatCurrency(proposal.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Tax (8%):</span>
                <span className="font-medium">{formatCurrency(proposal.tax)}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-300">
                <span>Total:</span>
                <span>{formatCurrency(proposal.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {proposal.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{proposal.notes}</p>
            </div>
          )}

          {/* Terms */}
          {proposal.terms && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{proposal.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
