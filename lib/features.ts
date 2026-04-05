/**
 * Feature flag utilities for Starforge stretch goals.
 *
 * Reads NEXT_PUBLIC_* env vars (inlined by Next.js at build time)
 * so these helpers work identically on server and client.
 *
 * When a flag is absent or set to anything other than "true",
 * the corresponding feature is disabled and the app degrades
 * gracefully to its localStorage-only baseline.
 */

export function isAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true'
}

export function isDbEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DB === 'true'
}

export function isAdminDashboardEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD === 'true'
}

export function isNeoEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_NEO !== 'false'
}
