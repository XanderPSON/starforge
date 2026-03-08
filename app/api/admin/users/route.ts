import { NextResponse } from 'next/server'
import type { Role } from '@/lib/generated/prisma/client'
import { auth } from '@/lib/auth'
import { listUsers, updateUserRole } from '@/lib/db'
import { isAdmin, requireAdmin } from '@/lib/roles'

function isRole(value: unknown): value is Role {
  return value === 'student' || value === 'admin'
}

async function getAuthorizedSession() {
  const session = await auth()

  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (!isAdmin(session)) {
    return { session: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  requireAdmin(session)
  return { session, response: null }
}

export async function GET() {
  const { response } = await getAuthorizedSession()
  if (response) return response

  const users = await listUsers()
  return NextResponse.json(
    users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }))
  )
}

export async function PATCH(request: Request) {
  const { session, response } = await getAuthorizedSession()
  if (response || !session) return response

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof payload !== 'object' || payload === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const userId = 'userId' in payload ? payload.userId : undefined
  const role = 'role' in payload ? payload.role : undefined

  if (typeof userId !== 'string' || userId.length === 0 || !isRole(role)) {
    return NextResponse.json({ error: 'Invalid userId or role' }, { status: 400 })
  }

  if (session.user.id === userId && role !== 'admin') {
    return NextResponse.json({ error: 'Cannot remove your own admin role' }, { status: 400 })
  }

  try {
    const updated = await updateUserRole(userId, role)
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    })
  } catch {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
}
