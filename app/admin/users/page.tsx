import { auth } from '@/lib/auth'
import { listUsers } from '@/lib/db'
import { getUserActivitySparklines } from '@/lib/admin-queries'
import { UserTable } from '@/components/admin/UserTable'
import { ExportCSVButton } from '@/components/admin/ExportCSVButton'

function formatLastActive(value?: Date | string): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

const csvColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'trainingsCompleted', label: 'Trainings Completed' },
  { key: 'lastActive', label: 'Last Active' },
] as const

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([auth(), listUsers()])

  const userIds = users.map((u) => u.id)
  const sparklineMap = await getUserActivitySparklines(userIds)

  const sparklines: Record<string, Array<{ date: string; count: number }>> = {}
  for (const [userId, points] of sparklineMap) {
    sparklines[userId] = points
  }

  const csvData = users.map((user) => ({
    name: user.name ?? 'Unnamed User',
    email: user.email,
    role: user.role,
    trainingsCompleted: user._count.progress,
    lastActive: formatLastActive(user.updatedAt),
  }))

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-hub-text dark:text-gray-100">Users</h1>
          <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">Manage learner/admin roles and monitor activity.</p>
        </div>
        <ExportCSVButton
          data={csvData}
          filename={`users-${today}.csv`}
          columns={[...csvColumns]}
        />
      </header>

      <UserTable users={users} currentUserId={session?.user?.id ?? ''} sparklines={sparklines} />
    </div>
  )
}
