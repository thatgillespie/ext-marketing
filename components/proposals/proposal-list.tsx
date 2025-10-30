"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Edit, Trash2, Eye, Search } from "lucide-react"
import { formatCurrency } from "@/lib/types/invoice"
import Link from "next/link"

interface Proposal {
  id: string
  proposalNumber: string
  title: string
  status: string
  subtotal: number
  tax: number
  total: number
  issueDate: string
  validUntil: string
  companyName?: string
  projectName?: string
}

interface ProposalListProps {
  proposals: Proposal[]
  onUpdate: () => void
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
}

export function ProposalList({ proposals, onUpdate }: ProposalListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onUpdate()
      } else {
        alert('Failed to delete proposal')
      }
    } catch (error) {
      console.error('Failed to delete proposal:', error)
      alert('Failed to delete proposal')
    } finally {
      setDeleting(null)
    }
  }

  // Filter proposals
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch =
      proposal.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proposal.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || proposal.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate totals by status
  const stats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'DRAFT').length,
    sent: proposals.filter(p => p.status === 'SENT').length,
    accepted: proposals.filter(p => p.status === 'ACCEPTED').length,
    rejected: proposals.filter(p => p.status === 'REJECTED').length,
    expired: proposals.filter(p => p.status === 'EXPIRED').length,
  }

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No proposals yet</p>
          <Link href="/dashboard/proposals/new">
            <Button>Create Your First Proposal</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter("ALL")}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter("DRAFT")}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-sm text-gray-500">Draft</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter("SENT")}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.sent}</p>
              <p className="text-sm text-gray-500">Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter("ACCEPTED")}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              <p className="text-sm text-gray-500">Accepted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter("REJECTED")}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter("EXPIRED")}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.expired}</p>
              <p className="text-sm text-gray-500">Expired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Proposals</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search proposals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredProposals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No proposals match your filters
              </div>
            ) : (
              filteredProposals.map(proposal => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-medium">{proposal.proposalNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[proposal.status]}`}>
                        {proposal.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{proposal.title}</p>
                    {proposal.companyName && (
                      <p className="text-sm text-gray-500">{proposal.companyName}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Issued: {new Date(proposal.issueDate).toLocaleDateString()}</span>
                      <span>Valid Until: {new Date(proposal.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(proposal.total)}</p>
                      <p className="text-xs text-gray-500">
                        Tax: {formatCurrency(proposal.tax)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/proposals/${proposal.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/proposals/${proposal.id}/edit`}>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(proposal.id)}
                        disabled={deleting === proposal.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
