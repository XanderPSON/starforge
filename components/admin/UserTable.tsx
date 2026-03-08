'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateUserRoleAction } from '@/app/admin/actions'

type UserRow = {
  id: string
  email: string
  name: string | null
  role: 'student' | 'admin'
  updatedAt?: Date | string
  _count: {
    progress: number
    responses: number
  }
}

interface UserTableProps {
  users: UserRow[]
  currentUserId: string
}

function formatLastActive(value?: Date | string): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

export function UserTable({ users, currentUserId }: UserTableProps) {
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (userId: string, role: 'student' | 'admin') => {
    setPendingUserId(userId)
    startTransition(() => {
      updateUserRoleAction(userId, role).finally(() => {
        setPendingUserId(null)
      })
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-black/[0.08] bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Trainings</th>
              <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelfAdmin = user.id === currentUserId && user.role === 'admin'
              const rowPending = isPending && pendingUserId === user.id
              return (
                <tr key={user.id} className="border-t border-black/[0.06] dark:border-white/10">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-medium text-hub-primary hover:underline dark:text-blue-300"
                    >
                      {user.name ?? 'Unnamed User'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-hub-muted dark:text-gray-300">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      disabled={isSelfAdmin || rowPending}
                      onChange={(event) => handleRoleChange(user.id, event.target.value as 'student' | 'admin')}
                      className="rounded-lg border border-black/[0.1] bg-white px-3 py-1.5 text-hub-text outline-none transition focus:border-hub-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white/10 dark:text-gray-100 dark:focus:border-blue-400"
                    >
                      <option value="student">student</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-hub-muted dark:text-gray-300">{user._count.progress}</td>
                  <td className="px-4 py-3 text-hub-muted dark:text-gray-400">{formatLastActive(user.updatedAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
