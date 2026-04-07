'use client'

const ADMIN_KEY = 'starforge:adminMode'
const ADMIN_EMAIL = 'xander.peterson@coinbase.com'

export function toggleAdminMode(): void {
  if (typeof window === 'undefined') return

  let next = true
  try {
    next = localStorage.getItem(ADMIN_KEY) !== 'true'
    localStorage.setItem(ADMIN_KEY, String(next))
  } catch {
  }

  window.dispatchEvent(
    new CustomEvent('starforge:adminModeChanged', { detail: { enabled: next } })
  )
}

/** @deprecated Use toggleAdminMode instead */
export const activateAdminMode = toggleAdminMode

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL
}
