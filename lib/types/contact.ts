export interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  jobTitle?: string | null
  isPrimary: boolean
  notes?: string | null
  companyId: string
  companyName?: string
  createdAt: string
  updatedAt: string
}

export interface ContactFormData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  jobTitle?: string
  isPrimary?: boolean
  notes?: string
  companyId: string
}

// Helper function to get full name
export function getFullName(contact: Contact): string {
  return `${contact.firstName} ${contact.lastName}`.trim()
}

// Helper function to get initials
export function getInitials(contact: Contact): string {
  return `${contact.firstName[0] || ''}${contact.lastName[0] || ''}`.toUpperCase()
}

// Helper function to format phone number (basic US format)
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return ''

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // Format as (XXX) XXX-XXXX for 10-digit numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  // Return original if not a standard format
  return phone
}

// Helper function to validate email
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return true // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to get contact display info
export function getContactDisplay(contact: Contact): string {
  const name = getFullName(contact)
  if (contact.jobTitle) {
    return `${name} (${contact.jobTitle})`
  }
  return name
}
