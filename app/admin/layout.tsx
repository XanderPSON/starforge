import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/roles'
import { isAdminDashboardEnabled, isAuthEnabled, isDbEnabled } from '@/lib/features'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authEnabled = isAuthEnabled()

  if (authEnabled) {
    if (!isAdminDashboardEnabled()) {
      redirect('/')
    }

    if (!isDbEnabled()) {
      return (
        <main className="min-h-screen bg-hub-bg px-6 py-10 dark:bg-transparent">
          <div className="mx-auto max-w-2xl rounded-xl border border-black/[0.08] bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
            <h1 className="text-xl font-semibold text-hub-text dark:text-gray-100">Database required</h1>
            <p className="mt-3 text-sm text-hub-muted dark:text-gray-400">
              The admin dashboard needs NEXT_PUBLIC_ENABLE_DB=true and a configured database connection.
            </p>
          </div>
        </main>
      )
    }

    const session = await auth()
    try {
      requireAdmin(session)
    } catch {
      redirect('/')
    }
  }

  return (
    <div className="min-h-screen bg-hub-bg dark:bg-transparent">
      <div className="mx-auto flex max-w-[1400px]">
        <AdminNav />
        <main className="min-w-0 flex-1 px-6 py-8 md:px-8">{children}</main>
      </div>
    </div>
  )
}
