"use client"

import { ContactForm } from "@/components/contacts/contact-form"

export default function NewContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Contact</h1>
        <p className="text-gray-500">Create a new contact for a client company</p>
      </div>

      <ContactForm />
    </div>
  )
}
