"use client"

import { ProposalForm } from "@/components/proposals/proposal-form"

export default function NewProposalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Proposal</h1>
        <p className="text-gray-500">Create a new proposal for a client</p>
      </div>

      <ProposalForm />
    </div>
  )
}
