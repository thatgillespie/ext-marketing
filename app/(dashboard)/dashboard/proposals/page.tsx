"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProposalList } from "@/components/proposals/proposal-list"
import Link from "next/link"

export default function ProposalsPage() {
  const { data: session } = useSession()
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchProposals = async () => {
    if (!session?.user) return

    try {
      const userId = (session.user as any).id
      const response = await fetch(`/api/proposals?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProposals(data)
      }
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [session, refreshKey])

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-gray-500">Manage and track your proposals</p>
        </div>
        <Link href="/dashboard/proposals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        </Link>
      </div>

      {/* Proposal List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading proposals...
        </div>
      ) : (
        <ProposalList proposals={proposals} onUpdate={handleUpdate} />
      )}
    </div>
  )
}
