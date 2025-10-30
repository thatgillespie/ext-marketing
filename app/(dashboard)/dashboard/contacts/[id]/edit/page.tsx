"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ContactForm } from "@/components/contacts/contact-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditContactPage() {
  const params = useParams()
  const router = useRouter()
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch(`/api/contacts/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setContact(data)
        } else {
          router.push('/dashboard/contacts')
        }
      } catch (error) {
        console.error('Failed to fetch contact:', error)
        router.push('/dashboard/contacts')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchContact()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading contact...</p>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Contact not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/contacts/${contact.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Contact</h1>
          <p className="text-gray-500">{contact.firstName} {contact.lastName}</p>
        </div>
      </div>

      <ContactForm
        contact={contact}
        onSuccess={() => router.push(`/dashboard/contacts/${contact.id}`)}
      />
    </div>
  )
}
