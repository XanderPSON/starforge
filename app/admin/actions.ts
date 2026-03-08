'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/roles'
import { updateUserRole } from '@/lib/db'
import { resolveAlert } from '@/lib/admin-queries'
import { isAuthEnabled } from '@/lib/features'

export async function updateUserRoleAction(userId: string, role: 'student' | 'admin') {
  const session = await auth()
  requireAdmin(session)

  if (session.user.id === userId && role === 'student') {
    throw new Error('You cannot remove your own admin access.')
  }

  await updateUserRole(userId, role)
  revalidatePath('/admin/users')
}

export async function resolveAlertAction(alertId: string) {
  if (!alertId) {
    throw new Error('Alert ID is required')
  }

  let resolvedByUserId = 'system'
  if (isAuthEnabled()) {
    const session = await auth()
    requireAdmin(session)
    resolvedByUserId = session.user.id
  }

  await resolveAlert(alertId, resolvedByUserId)
  revalidatePath('/admin/alerts')
}
