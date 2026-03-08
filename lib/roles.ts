import type { Session } from 'next-auth'
import { isAuthEnabled } from '@/lib/features'

const ADMIN_MODE_KEY = 'starforge:adminMode'

export function isAdmin(session: Session | null): boolean {
  if (isAuthEnabled()) {
    return session?.user?.role === 'admin'
  }

  if (typeof window === 'undefined') return false

  try {
    return localStorage.getItem(ADMIN_MODE_KEY) === 'true'
  } catch {
    return false
  }
}

export function requireAdmin(session: Session | null): asserts session {
  if (!session?.user) {
    throw new Error('UNAUTHORIZED')
  }
  if (!isAdmin(session)) {
    throw new Error('FORBIDDEN')
  }
}

export function getUserRole(session: Session | null): 'student' | 'admin' {
  return isAdmin(session) ? 'admin' : 'student'
}
