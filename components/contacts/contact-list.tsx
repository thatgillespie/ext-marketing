"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Edit, Trash2, Eye, Search, Mail, Phone, Star } from "lucide-react"
import { getFullName, formatPhoneNumber, getInitials } from "@/lib/types/contact"
import Link from "next/link"

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  jobTitle?: string | null
  isPrimary: boolean
  companyName?: string
  notes?: string | null
}

interface ContactListProps {
  contacts: Contact[]
  onUpdate: () => void
}

export function ContactList({ contacts, onUpdate }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [companyFilter, setCompanyFilter] = useState<string>("ALL")
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onUpdate()
      } else {
        alert('Failed to delete contact')
      }
    } catch (error) {
      console.error('Failed to delete contact:', error)
      alert('Failed to delete contact')
    } finally {
      setDeleting(null)
    }
  }

  // Get unique companies for filter
  const companies = Array.from(new Set(contacts.map(c => c.companyName).filter(Boolean)))
    .sort() as string[]

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      getFullName(contact).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (contact.jobTitle?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (contact.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase())

    const matchesCompany = companyFilter === "ALL" || contact.companyName === companyFilter

    return matchesSearch && matchesCompany
  })

  // Group by company
  const groupedContacts: Record<string, Contact[]> = {}
  filteredContacts.forEach(contact => {
    const company = contact.companyName || 'No Company'
    if (!groupedContacts[company]) {
      groupedContacts[company] = []
    }
    groupedContacts[company].push(contact)
  })

  if (contacts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No contacts yet</p>
          <Link href="/dashboard/contacts/new">
            <Button>Add Your First Contact</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contacts</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="ALL">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 mb-4">
            Showing {filteredContacts.length} of {contacts.length} contacts
          </div>

          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No contacts match your filters
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedContacts).map(([company, companyContacts]) => (
                <div key={company}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    {company}
                    <span className="text-xs font-normal text-gray-500">
                      ({companyContacts.length})
                    </span>
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {companyContacts.map(contact => (
                      <div
                        key={contact.id}
                        className="flex items-start gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                            {getInitials(contact)}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {getFullName(contact)}
                            </p>
                            {contact.isPrimary && (
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" title="Primary Contact" />
                            )}
                          </div>
                          {contact.jobTitle && (
                            <p className="text-xs text-gray-600 truncate">{contact.jobTitle}</p>
                          )}
                          <div className="mt-2 space-y-1">
                            {contact.email && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="h-3 w-3" />
                                <span>{formatPhoneNumber(contact.phone)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          <Link href={`/dashboard/contacts/${contact.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/contacts/${contact.id}/edit`}>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(contact.id)}
                            disabled={deleting === contact.id}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
