import { auth } from '@/lib/auth'
import { listUsers } from '@/lib/db'
import { UserTable } from '@/components/admin/UserTable'

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([auth(), listUsers()])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-hub-text dark:text-gray-100">Users</h1>
        <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">Manage learner/admin roles and monitor activity.</p>
      </header>

      <UserTable users={users} currentUserId={session?.user?.id ?? ''} />
    </div>
  )
}
