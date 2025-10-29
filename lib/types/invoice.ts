export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type ProposalStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  order: number
  productId?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  title: string
  description?: string
  status: InvoiceStatus
  issueDate: number
  dueDate: number
  paidDate?: number
  subtotal: number
  tax: number
  total: number
  notes?: string
  terms?: string
  companyId: string
  companyName?: string
  companyAddress?: string
  companyEmail?: string
  projectId?: string
  projectName?: string
  createdById: string
  createdByName?: string
  createdAt: number
  updatedAt: number
  items?: InvoiceItem[]
}

export interface ProposalItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  order: number
  productId?: string
}

export interface Proposal {
  id: string
  proposalNumber: string
  title: string
  description?: string
  status: ProposalStatus
  validUntil?: number
  sentAt?: number
  acceptedAt?: number
  subtotal: number
  tax: number
  total: number
  notes?: string
  terms?: string
  companyId: string
  companyName?: string
  projectId?: string
  projectName?: string
  createdById: string
  createdByName?: string
  createdAt: number
  updatedAt: number
  items?: ProposalItem[]
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled'
}

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600'
}

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired'
}

export const PROPOSAL_STATUS_COLORS: Record<ProposalStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800'
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function generateInvoiceNumber(): string {
  const prefix = 'INV'
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${year}${month}-${random}`
}

export function generateProposalNumber(): string {
  const prefix = 'PROP'
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${year}${month}-${random}`
}
