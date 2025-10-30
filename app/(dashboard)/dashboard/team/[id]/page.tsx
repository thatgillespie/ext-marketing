"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Mail, Phone, Briefcase, Calendar, DollarSign } from "lucide-react"
import { getUserDisplayName, getUserInitials, ROLE_COLORS, ROLE_LABELS, formatHourlyRate } from "@/lib/types/user"
import Link from "next/link"

export default function UserDetailPage() {
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to deactivate this user?')) return

    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/dashboard/team')
      } else {
        alert('Failed to deactivate user')
      }
    } catch (error) {
      console.error('Failed to deactivate user:', error)
      alert('Failed to deactivate user')
    }
  }

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/team">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
              {getUserInitials(user)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{getUserDisplayName(user)}</h1>
                {!user.active && (
                  <span className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-gray-500">{user.jobTitle || user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/team/${user.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          {user.active && (
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {/* User Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a
                  href={`mailto:${user.email}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {user.email}
                </a>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a
                    href={`tel:${user.phone}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {user.phone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <span className={`inline-block text-sm px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}`}>
                  {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.department && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="text-sm font-medium">{user.department}</p>
                </div>
              </div>
            )}

            {user.jobTitle && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Job Title</p>
                  <p className="text-sm font-medium">{user.jobTitle}</p>
                </div>
              </div>
            )}

            {user.hourlyRate && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Hourly Rate</p>
                  <p className="text-sm font-medium">{formatHourlyRate(user.hourlyRate)}</p>
                </div>
              </div>
            )}

            {user.startDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-sm font-medium">
                    {new Date(user.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Updated</p>
              <p className="font-medium">{new Date(user.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
