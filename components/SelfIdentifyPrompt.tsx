'use client'

import { useState, useEffect, useCallback } from 'react'
import { isDbEnabled, isAuthEnabled } from '@/lib/features'
import {
  getSelfIdentity,
  setSelfIdentity,
  generateSessionId,
} from '@/lib/event-tracking'
import { selfIdentify } from '@/app/actions/self-identify'
import { isAdminEmail, activateAdminMode } from '@/lib/admin-access'

const DISMISSED_KEY = 'starforge:selfIdDismissed'

export function SelfIdentifyPrompt() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthEnabled() || !isDbEnabled()) return

    const existing = getSelfIdentity()
    if (existing) {
      if (isAdminEmail(existing.email)) {
        activateAdminMode()
      }
      return
    }

    try {
      if (localStorage.getItem(DISMISSED_KEY) === 'true') return
    } catch {
      return
    }

    setVisible(true)
  }, [])

  const handleSubmit = useCallback(async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setSubmitting(true)
    setError(null)

    const persistentId = generateSessionId()
    const result = await selfIdentify(trimmed, name.trim() || undefined, persistentId)

    if (!result.success) {
      setError(result.error ?? 'Something went wrong')
      setSubmitting(false)
      return
    }

    setSelfIdentity({
      email: trimmed,
      name: name.trim() || undefined,
      userId: result.userId,
    })

    if (isAdminEmail(trimmed)) {
      activateAdminMode()
    }

    setVisible(false)
  }, [email, name])

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, 'true')
    } catch {
    }
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/10 p-8 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100 mb-1">
          Welcome to Starforge
        </h2>
        <p className="text-sm text-hub-muted dark:text-gray-400 mb-6">
          Enter your email so we can track your training progress. You only need to do this once.
        </p>

        <div className="space-y-3">
          <div>
            <label htmlFor="self-id-email" className="block text-xs font-medium text-hub-muted dark:text-gray-400 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="self-id-email"
              type="email"
              placeholder="you@coinbase.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit() }}
              disabled={submitting}
              className="w-full px-3 py-2 rounded-lg border border-black/[0.12] dark:border-white/15 bg-white dark:bg-white/5 text-sm text-hub-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hub-primary/40 dark:focus:ring-blue-500/40 disabled:opacity-50"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="self-id-name" className="block text-xs font-medium text-hub-muted dark:text-gray-400 mb-1">
              Name <span className="text-hub-muted dark:text-gray-500">(optional)</span>
            </label>
            <input
              id="self-id-name"
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit() }}
              disabled={submitting}
              className="w-full px-3 py-2 rounded-lg border border-black/[0.12] dark:border-white/15 bg-white dark:bg-white/5 text-sm text-hub-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hub-primary/40 dark:focus:ring-blue-500/40 disabled:opacity-50"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={handleDismiss}
            disabled={submitting}
            className="text-xs text-hub-muted dark:text-gray-500 hover:text-hub-text dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={submitting || !email.trim()}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-hub-primary text-white hover:bg-hub-primary-dark shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
