'use client'

const ADMIN_KEY = 'starforge:adminMode'
const ADMIN_EMAIL = 'xander.peterson@coinbase.com'

export function activateAdminMode(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(ADMIN_KEY, 'true')
  } catch {
  }

  window.dispatchEvent(
    new CustomEvent('starforge:adminModeChanged', { detail: { enabled: true } })
  )
}

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL
}
