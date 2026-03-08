'use client'

import type { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { isAuthEnabled } from '@/lib/features'

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!isAuthEnabled()) return <>{children}</>
  return <SessionProvider>{children}</SessionProvider>
}
