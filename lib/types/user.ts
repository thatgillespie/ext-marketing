export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CLIENT' | 'CONTRACTOR'

export interface User {
  id: string
  name?: string | null
  email: string
  role: UserRole
  avatar?: string | null
  phone?: string | null
  department?: string | null
  jobTitle?: string | null
  hourlyRate?: number | null
  startDate?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface UserFormData {
  name?: string
  email: string
  password?: string
  role: UserRole
  phone?: string
  department?: string
  jobTitle?: string
  hourlyRate?: number
  startDate?: string
  active?: boolean
}

// Role labels for display
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  CLIENT: 'Client',
  CONTRACTOR: 'Contractor',
}

// Role colors for badges
export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  EMPLOYEE: 'bg-green-100 text-green-800',
  CLIENT: 'bg-orange-100 text-orange-800',
  CONTRACTOR: 'bg-gray-100 text-gray-800',
}

// Permission levels (higher = more permissions)
export const ROLE_LEVELS: Record<UserRole, number> = {
  ADMIN: 4,
  MANAGER: 3,
  EMPLOYEE: 2,
  CONTRACTOR: 1,
  CLIENT: 0,
}

// Helper to check if a role has permission
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]
}

// Helper to get user display name
export function getUserDisplayName(user: User): string {
  return user.name || user.email.split('@')[0] || 'Unknown User'
}

// Helper to get user initials
export function getUserInitials(user: User): string {
  if (user.name) {
    const parts = user.name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return user.name.substring(0, 2).toUpperCase()
  }
  return user.email.substring(0, 2).toUpperCase()
}

// Helper to format hourly rate
export function formatHourlyRate(rate: number | null | undefined): string {
  if (!rate) return 'Not set'
  return `$${rate.toFixed(2)}/hr`
}

// Helper to check if user is active
export function isUserActive(user: User): boolean {
  return user.active
}

// Helper to get days since user joined
export function getDaysSinceJoined(startDate: string | null | undefined): number | null {
  if (!startDate) return null
  const start = new Date(startDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Helper to validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper to validate password strength
export function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  return { valid: true }
}
