'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/roles'
import { updateUserRole } from '@/lib/db'

export async function updateUserRoleAction(userId: string, role: 'student' | 'admin') {
  const session = await auth()
  requireAdmin(session)

  if (session.user.id === userId && role === 'student') {
    throw new Error('You cannot remove your own admin access.')
  }

  await updateUserRole(userId, role)
  revalidatePath('/admin/users')
}
