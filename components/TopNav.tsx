'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import { isAdminDashboardEnabled, isAuthEnabled } from '@/lib/features'

const ADMIN_KEY = 'starforge:adminMode'

export function TopNav() {
  if (isAuthEnabled()) return <TopNavWithAuth />
  return <TopNavLocal />
}

function BrandHomeLink() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-black/[0.04] dark:hover:bg-white/10"
      aria-label="Starforge home"
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-hub-primary/30 dark:bg-[#27466A] blur-[6px] opacity-45 dark:opacity-60" aria-hidden="true" />
        {/* Light mode nav star */}
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative dark:hidden" aria-hidden="true">
          <defs>
            <linearGradient id="sfNavOrbitGradL" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7B9BC5" /><stop offset="100%" stopColor="#B8CFEA" /></linearGradient>
            <linearGradient id="sfNavCoreGradL" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C7D8EC" /><stop offset="100%" stopColor="#FFFFFF" /></linearGradient>
            <radialGradient id="sfNavHexCoreL" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16 16) rotate(90) scale(8)"><stop offset="0%" stopColor="#D4E2F2" /><stop offset="100%" stopColor="#E8F0FA" /></radialGradient>
          </defs>
          <circle cx="16" cy="16" r="11.25" stroke="url(#sfNavOrbitGradL)" strokeWidth="1.35" opacity="0.85" />
          <ellipse cx="16" cy="16" rx="13" ry="5.15" transform="rotate(-28 16 16)" stroke="url(#sfNavOrbitGradL)" strokeWidth="1.1" opacity="0.8" />
          <ellipse cx="16" cy="16" rx="13" ry="5.15" transform="rotate(28 16 16)" stroke="url(#sfNavOrbitGradL)" strokeWidth="1.1" opacity="0.65" />
          <polygon points="16,9.2 21.2,12.2 21.2,18.2 16,21.2 10.8,18.2 10.8,12.2" fill="url(#sfNavHexCoreL)" stroke="#9DB4CF" strokeWidth="1" opacity="0.95" />
          <path d="M16 6.2L17.85 12.8L24.5 14.65L17.85 16.5L16 23.1L14.15 16.5L7.5 14.65L14.15 12.8Z" fill="url(#sfNavCoreGradL)" />
          <path d="M16 4.9V7.2M27.1 16H24.8M16 27.1V24.8M4.9 16H7.2" stroke="#9DB4CF" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
        </svg>
        {/* Dark mode nav star */}
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative hidden dark:block" aria-hidden="true">
          <defs>
            <linearGradient id="sfNavOrbitGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2D4E76" /><stop offset="100%" stopColor="#9DB4CF" /></linearGradient>
            <linearGradient id="sfNavCoreGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7F99BC" /><stop offset="100%" stopColor="#E3EDF8" /></linearGradient>
            <radialGradient id="sfNavHexCore" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16 16) rotate(90) scale(8)"><stop offset="0%" stopColor="#162844" /><stop offset="100%" stopColor="#0C172C" /></radialGradient>
          </defs>
          <circle cx="16" cy="16" r="11.25" stroke="url(#sfNavOrbitGrad)" strokeWidth="1.35" opacity="0.75" />
          <ellipse cx="16" cy="16" rx="13" ry="5.15" transform="rotate(-28 16 16)" stroke="url(#sfNavOrbitGrad)" strokeWidth="1.1" opacity="0.7" />
          <ellipse cx="16" cy="16" rx="13" ry="5.15" transform="rotate(28 16 16)" stroke="url(#sfNavOrbitGrad)" strokeWidth="1.1" opacity="0.55" />
          <polygon points="16,9.2 21.2,12.2 21.2,18.2 16,21.2 10.8,18.2 10.8,12.2" fill="url(#sfNavHexCore)" stroke="#6283A8" strokeWidth="1" opacity="0.95" />
          <path d="M16 6.2L17.85 12.8L24.5 14.65L17.85 16.5L16 23.1L14.15 16.5L7.5 14.65L14.15 12.8Z" fill="url(#sfNavCoreGrad)" />
          <path d="M16 4.9V7.2M27.1 16H24.8M16 27.1V24.8M4.9 16H7.2" stroke="#AFC2D8" strokeWidth="1" strokeLinecap="round" opacity="0.82" />
        </svg>
      </span>
      <span className="text-sm font-bold tracking-[0.06em] leading-none uppercase bg-gradient-to-r from-[#1a3a5c] via-[#2D4E76] to-[#4a7099] dark:from-[#335B86] dark:via-[#9CB5D1] dark:to-[#E3EDF8] bg-clip-text text-transparent select-none">
        Starforge
      </span>
    </Link>
  )
}

function TopNavWithAuth() {
  const { data: session } = useSession()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch (_) {}
  }

  const isAdmin = session?.user?.role === 'admin'
  const showDashboard = isAdmin && isAdminDashboardEnabled()

  return (
    <nav className="sticky top-0 z-50 h-12 flex items-center justify-between px-4 md:px-6 bg-hub-surface dark:bg-gray-900/80 dark:backdrop-blur border-b border-black/[0.08] dark:border-white/10">
      <BrandHomeLink />

      <div className="flex items-center gap-2">
        {isAdmin && (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
            Admin
          </span>
        )}

        {showDashboard && (
          <Link
            href="/admin"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-hub-muted dark:text-gray-300 hover:text-hub-text dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all duration-150"
          >
            Dashboard
          </Link>
        )}

        {session?.user ? (
          <>
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-md bg-black/[0.04] dark:bg-white/10">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? 'User avatar'}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <span className="h-6 w-6 rounded-full bg-hub-primary/20 dark:bg-blue-500/30 text-[10px] font-semibold text-hub-primary dark:text-blue-300 flex items-center justify-center">
                  {(session.user.name ?? session.user.email ?? 'U').charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-xs text-hub-text dark:text-gray-100 max-w-32 truncate">
                {session.user.name ?? session.user.email}
              </span>
            </div>
            <button
              onClick={() => void signOut()}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-hub-muted dark:text-gray-300 hover:text-hub-text dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all duration-150"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => void signIn('google')}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-hub-muted dark:text-gray-300 hover:text-hub-text dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all duration-150"
          >
            Sign In
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-hub-muted dark:text-gray-300 hover:text-hub-text dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all duration-150"
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  )
}

function TopNavLocal() {
  const [dark, setDark] = useState(false)
  const [adminMode, setAdminMode] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
    try {
      setAdminMode(localStorage.getItem(ADMIN_KEY) === 'true')
    } catch (_) {}

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { enabled?: boolean } | undefined
      setAdminMode(detail?.enabled ?? false)
    }
    window.addEventListener('starforge:adminModeChanged', handler)
    return () => window.removeEventListener('starforge:adminModeChanged', handler)
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch (_) {}
  }

  return (
    <nav className="sticky top-0 z-50 h-12 flex items-center justify-between px-4 md:px-6 bg-hub-surface dark:bg-gray-900/80 dark:backdrop-blur border-b border-black/[0.08] dark:border-white/10">
      <BrandHomeLink />

      <div className="flex items-center gap-2">
        {adminMode && (
          <>
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              Admin
            </span>
            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-md text-xs font-medium text-hub-muted dark:text-gray-300 hover:text-hub-text dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all duration-150"
            >
              Dashboard
            </Link>
          </>
        )}

        <button
          onClick={toggleTheme}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-hub-muted dark:text-gray-300 hover:text-hub-text dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all duration-150"
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  )
}
