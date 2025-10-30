"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { UserForm } from "@/components/team/user-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setUser(data)
        } else {
          router.push('/dashboard/team')
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        router.push('/dashboard/team')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUser()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading user...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/team/${user.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Team Member</h1>
          <p className="text-gray-500">{user.name || user.email}</p>
        </div>
      </div>

      <UserForm
        user={user}
        onSuccess={() => router.push(`/dashboard/team/${user.id}`)}
      />
    </div>
  )
}
