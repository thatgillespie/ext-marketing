"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Edit, Trash2, Eye, Search, Mail, Phone } from "lucide-react"
import { getUserDisplayName, getUserInitials, ROLE_COLORS, ROLE_LABELS, formatHourlyRate, UserRole } from "@/lib/types/user"
import Link from "next/link"

interface UserListProps {
  users: any[]
  onUpdate: () => void
}

export function UserList({ users, onUpdate }: UserListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE")
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onUpdate()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to deactivate user')
      }
    } catch (error) {
      console.error('Failed to deactivate user:', error)
      alert('Failed to deactivate user')
    } finally {
      setDeleting(null)
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      getUserDisplayName(user).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.jobTitle?.toLowerCase() || '').includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter
    const matchesStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" && user.active) || (statusFilter === "INACTIVE" && !user.active)

    return matchesSearch && matchesRole && matchesStatus
  })

  // Group by role
  const groupedUsers: Record<string, any[]> = {}
  filteredUsers.forEach(user => {
    const roleLabel = ROLE_LABELS[user.role as UserRole]
    if (!groupedUsers[roleLabel]) {
      groupedUsers[roleLabel] = []
    }
    groupedUsers[roleLabel].push(user)
  })

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    manager: users.filter(u => u.role === 'MANAGER').length,
    employee: users.filter(u => u.role === 'EMPLOYEE').length,
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No team members yet</p>
          <Link href="/dashboard/team/new">
            <Button>Add Your First Team Member</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => { setRoleFilter("ALL"); setStatusFilter("ALL") }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter("ACTIVE")}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setRoleFilter("ADMIN")}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.admin}</p>
              <p className="text-sm text-gray-500">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setRoleFilter("EMPLOYEE")}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.employee}</p>
              <p className="text-sm text-gray-500">Employees</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="ALL">All Roles</option>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 mb-4">
            Showing {filteredUsers.length} of {users.length} users
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users match your filters
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedUsers).map(([role, roleUsers]) => (
                <div key={role}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    {role}
                    <span className="text-xs font-normal text-gray-500">
                      ({roleUsers.length})
                    </span>
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {roleUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-start gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                            {getUserInitials(user)}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {getUserDisplayName(user)}
                            </p>
                            {!user.active && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role as UserRole]}`}>
                            {ROLE_LABELS[user.role as UserRole]}
                          </span>
                          {user.jobTitle && (
                            <p className="text-xs text-gray-600 mt-1">{user.jobTitle}</p>
                          )}
                          {user.department && (
                            <p className="text-xs text-gray-500">{user.department}</p>
                          )}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="h-3 w-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                            {user.hourlyRate && (
                              <div className="text-xs text-gray-600 font-medium">
                                {formatHourlyRate(user.hourlyRate)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          <Link href={`/dashboard/team/${user.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/team/${user.id}/edit`}>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                          {user.active && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(user.id)}
                              disabled={deleting === user.id}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
