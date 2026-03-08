import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAlerts, getUnresolvedAlertCount, resolveAlert } from '@/lib/admin-queries'
import { isAdmin, requireAdmin } from '@/lib/roles'

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

function parseResolvedFilter(value: string | null): boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  return false
}

function parseLimit(value: string | null): number {
  if (!value) return 50
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return 50
  return Math.min(parsed, 200)
}

export async function GET(request: Request) {
  const { response } = await getAuthorizedSession()
  if (response) return response

  const { searchParams } = new URL(request.url)
  const resolved = parseResolvedFilter(searchParams.get('resolved'))
  const limit = parseLimit(searchParams.get('limit'))

  const [alerts, unresolvedCount] = await Promise.all([
    getAlerts({ resolved, limit }),
    getUnresolvedAlertCount(),
  ])

  return NextResponse.json({ alerts, count: unresolvedCount })
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

  const alertId = 'alertId' in payload ? payload.alertId : undefined
  if (typeof alertId !== 'string' || alertId.length === 0) {
    return NextResponse.json({ error: 'Invalid alertId' }, { status: 400 })
  }

  const resolvedAlert = await resolveAlert(alertId, session.user.id)
  if (!resolvedAlert) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  }

  return NextResponse.json(resolvedAlert)
}
