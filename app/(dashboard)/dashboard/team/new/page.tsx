"use client"

import { UserForm } from "@/components/team/user-form"

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Team Member</h1>
        <p className="text-gray-500">Create a new user account</p>
      </div>

      <UserForm />
    </div>
  )
}
