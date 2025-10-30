"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UserList } from "@/components/team/user-list"
import Link from "next/link"

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [refreshKey])

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-gray-500">Manage your team members and permissions</p>
        </div>
        <Link href="/dashboard/team/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </Link>
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading team members...
        </div>
      ) : (
        <UserList users={users} onUpdate={handleUpdate} />
      )}
    </div>
  )
}
