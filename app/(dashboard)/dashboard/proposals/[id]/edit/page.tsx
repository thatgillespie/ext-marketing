"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProposalForm } from "@/components/proposals/proposal-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditProposalPage() {
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
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/proposals/${proposal.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Proposal</h1>
          <p className="text-gray-500">{proposal.proposalNumber}</p>
        </div>
      </div>

      <ProposalForm
        proposal={proposal}
        onSuccess={() => router.push(`/dashboard/proposals/${proposal.id}`)}
      />
    </div>
  )
}
