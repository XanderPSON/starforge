'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ComponentRegistryProvider } from '@/components/ComponentRegistryProvider'
import { safeGetItem, safeSetItem, getStorageKey } from '@/lib/storage'
import { LEARNING_EVENT_TYPES, trackEvent } from '@/lib/event-tracking'
import { toTitleCase } from '@/lib/utils'
import type { TrainingFrontmatter } from '@/lib/mdx'
import type { SidebarGroup } from '@/lib/training-pages'
import type { ReactNode } from 'react'

interface TrainingViewerProps {
  slug: string
  currentPageIndex: number
  totalPages: number
  pageHeading: string
  sidebarGroups: SidebarGroup[]
  requiredIds: string[]
  showHeader: boolean
  pageExplicitlyRequested: boolean
  frontmatter: TrainingFrontmatter | null
  children: ReactNode
}

const NAV_KEY = (slug: string) => `codelab:${slug}:__nav`

function isIdAnswered(slug: string, rawId: string): boolean {
  const key = getStorageKey(slug, rawId)
  const rawValue = safeGetItem(key)
  if (rawValue === null) return false
  if (typeof rawValue === 'string') return rawValue.trim().length > 0
  if (typeof rawValue === 'object' && rawValue !== null) {
    return (rawValue as { isSubmitted?: boolean }).isSubmitted === true
  }
  return false
}

const TAG_COLORS = [
  'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30',
  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30',
  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
  'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
]

function getTagColor(tag: string): string {
  let hash = 0
  for (const ch of tag) hash = (hash * 31 + ch.charCodeAt(0)) % TAG_COLORS.length
  return TAG_COLORS[hash]!
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30',
  intermediate: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  advanced: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
}

export default function TrainingViewer({
  slug,
  currentPageIndex,
  totalPages,
  sidebarGroups,
  requiredIds,
  showHeader,
  pageExplicitlyRequested,
  frontmatter,
  children,
}: TrainingViewerProps) {
  const router = useRouter()
  const [allAnswered, setAllAnswered] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminMode, setAdminMode] = useState(false)
  const pageEnteredAtRef = useRef<number>(Date.now())
  const previousPageIndexRef = useRef<number | null>(null)
  const currentPageIndexRef = useRef<number>(currentPageIndex)

  const checkGate = useCallback(() => {
    if (requiredIds.length === 0) {
      setAllAnswered(true)
      return
    }
    setAllAnswered(requiredIds.every((id) => isIdAnswered(slug, id)))
  }, [requiredIds, slug])

  // Read admin mode on mount + listen for changes
  useEffect(() => {
    try {
      setAdminMode(localStorage.getItem('starforge:adminMode') === 'true')
    } catch (_) {}

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { enabled?: boolean } | undefined
      setAdminMode(detail?.enabled ?? false)
    }
    window.addEventListener('starforge:adminModeChanged', handler)
    return () => window.removeEventListener('starforge:adminModeChanged', handler)
  }, [])

  // On mount: handle resume redirect (page 0 only, when no explicit page was requested) + save current page + scroll to top
  useEffect(() => {
    if (currentPageIndex === 0 && !pageExplicitlyRequested) {
      const navState = safeGetItem<{ currentPage: number }>(NAV_KEY(slug))
      if (navState && typeof navState.currentPage === 'number' && navState.currentPage > 0 && navState.currentPage < totalPages) {
        router.replace(`/training/${slug}?page=${navState.currentPage}`)
        return
      }
    }

    if (previousPageIndexRef.current !== null && previousPageIndexRef.current !== currentPageIndex) {
      const durationMs = Date.now() - pageEnteredAtRef.current
      trackEvent(LEARNING_EVENT_TYPES.PAGE_EXIT, {
        slug,
        pageIndex: previousPageIndexRef.current,
        metadata: {
          durationMs,
          durationSeconds: Math.round(durationMs / 1000),
          reason: 'page_change',
          toPageIndex: currentPageIndex,
        },
      })
    }

    pageEnteredAtRef.current = Date.now()
    previousPageIndexRef.current = currentPageIndex
    currentPageIndexRef.current = currentPageIndex

    safeSetItem(NAV_KEY(slug), { currentPage: currentPageIndex })
    trackEvent(LEARNING_EVENT_TYPES.PAGE_VIEW, {
      slug,
      pageIndex: currentPageIndex,
      metadata: {
        source: 'training_viewer',
      },
    })
    checkGate()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageIndex])

  useEffect(() => {
    return () => {
      const durationMs = Date.now() - pageEnteredAtRef.current
      trackEvent(LEARNING_EVENT_TYPES.PAGE_EXIT, {
        slug,
        pageIndex: currentPageIndexRef.current,
        metadata: {
          durationMs,
          durationSeconds: Math.round(durationMs / 1000),
          reason: 'unmount',
        },
      })
    }
  }, [slug])

  // Listen for codelab:saved events to re-check gate
  useEffect(() => {
    window.addEventListener('codelab:saved', checkGate)
    return () => window.removeEventListener('codelab:saved', checkGate)
  }, [checkGate])

  const goToPage = (page: number, source: 'next' | 'previous' | 'direct' = 'direct') => {
    if (source === 'next' || source === 'previous') {
      trackEvent(LEARNING_EVENT_TYPES.NAV_CLICK, {
        slug,
        pageIndex: currentPageIndex,
        metadata: {
          direction: source,
          fromPageIndex: currentPageIndex,
          toPageIndex: page,
          buttonLabel: source === 'next' ? 'Next' : 'Previous',
        },
      })
    }

    router.push(`/training/${slug}?page=${page}`)
  }

  const isFirstPage = currentPageIndex === 0
  const isLastPage = currentPageIndex === totalPages - 1
  const effectiveAllAnswered = adminMode || allAnswered
  const canGoNext = effectiveAllAnswered && !isLastPage
  const canGoPrev = !isFirstPage

  const duration = frontmatter?.duration ?? null
  const minutesPerPage = duration && totalPages > 0 ? duration / totalPages : null
  const minutesRemaining = minutesPerPage !== null ? Math.round((totalPages - currentPageIndex - 1) * minutesPerPage) : null

  return (
    <div className="min-h-screen bg-hub-bg dark:bg-transparent flex">
      {/* Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0 transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
          bg-hub-surface dark:bg-white/5 border-r border-black/[0.08] dark:border-white/10
          sticky top-12 h-[calc(100vh-3rem)]
        `}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-black/[0.08] dark:border-white/10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-hub-muted dark:text-gray-400">
              Progress
            </span>
            {duration !== null && (
              <span className="ml-2 text-xs text-hub-muted dark:text-gray-500">
                {duration} min total
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-hub-muted dark:text-gray-500 hover:text-hub-text dark:hover:text-gray-200 transition-colors p-1 rounded"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sidebarGroups.map((group, gi) => {
            const groupHasActive = group.pages.some((p) => p.pageIndex === currentPageIndex)
            const allCompleted = group.pages.every((p) => p.pageIndex < currentPageIndex)

            if (group.label) {
              return (
                <div key={gi} className="mb-2">
                  <div className={`
                    px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider
                    ${allCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : groupHasActive
                      ? 'text-hub-primary dark:text-blue-300'
                      : 'text-hub-muted dark:text-gray-500'
                    }
                  `}>
                    {group.label}
                  </div>
                  <div className="ml-2 border-l border-black/[0.06] dark:border-white/10 pl-1">
                    {group.pages.map((page) => {
                      const isCompleted = page.pageIndex < currentPageIndex
                      const isActive = page.pageIndex === currentPageIndex
                      const isFuture = page.pageIndex > currentPageIndex
                      const isLocked = isFuture && !adminMode

                      return (
                        <button
                          key={page.pageIndex}
                          onClick={() => !isLocked && goToPage(page.pageIndex, 'direct')}
                          disabled={isLocked}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg mb-0.5 text-sm transition-all duration-150
                            flex items-start gap-2
                            ${isActive
                              ? 'bg-hub-primary/10 dark:bg-blue-500/20 text-hub-primary dark:text-blue-300 font-semibold'
                              : isLocked
                              ? 'text-hub-muted dark:text-gray-500 cursor-not-allowed opacity-60'
                              : 'text-hub-text dark:text-gray-300 hover:bg-hub-surface-alt dark:hover:bg-white/10 cursor-pointer'
                            }
                          `}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <span className={`flex-shrink-0 w-3.5 h-3.5 mt-0.5 rounded-full flex items-center justify-center text-[9px] font-bold border
                            ${isCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : isActive
                              ? 'border-hub-primary dark:border-blue-400 bg-hub-primary/10 dark:bg-blue-500/20 text-hub-primary dark:text-blue-300'
                              : 'border-gray-300 dark:border-gray-600'
                            }
                          `}>
                            {isCompleted ? '✓' : isActive ? '●' : ''}
                          </span>
                          <span className="leading-tight line-clamp-2">{page.text}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            }

            const page = group.pages[0]!
            const isCompleted = page.pageIndex < currentPageIndex
            const isActive = page.pageIndex === currentPageIndex
            const isFuture = page.pageIndex > currentPageIndex
            const isLocked = isFuture && !adminMode

            return (
              <button
                key={gi}
                onClick={() => !isLocked && goToPage(page.pageIndex, 'direct')}
                disabled={isLocked}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg mb-1 text-sm transition-all duration-150
                  flex items-start gap-2
                  ${isActive
                    ? 'bg-hub-primary/10 dark:bg-blue-500/20 text-hub-primary dark:text-blue-300 font-semibold'
                    : isLocked
                    ? 'text-hub-muted dark:text-gray-500 cursor-not-allowed opacity-60'
                    : 'text-hub-text dark:text-gray-300 hover:bg-hub-surface-alt dark:hover:bg-white/10 cursor-pointer'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded-full flex items-center justify-center text-[10px] font-bold border
                  ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'border-hub-primary dark:border-blue-400 bg-hub-primary/10 dark:bg-blue-500/20 text-hub-primary dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600'
                  }
                `}>
                  {isCompleted ? '✓' : isActive ? '●' : ''}
                </span>
                <span className="leading-tight line-clamp-2">{page.text}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Sidebar toggle when closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-40
            bg-hub-surface dark:bg-white/10 border border-black/[0.08] dark:border-white/20
            rounded-r-lg px-2 py-3 text-hub-muted dark:text-gray-400 hover:text-hub-text dark:hover:text-gray-200
            transition-colors shadow-sm"
          aria-label="Open sidebar"
        >
          <span className="text-xs">▶</span>
        </button>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-24">
        {showHeader && frontmatter && (
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-0">
            <header className="mb-10 bg-hub-surface dark:bg-white/5 dark:backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-white/10 shadow-sm p-8">
              {frontmatter.title && (
                <h1 className="text-4xl font-bold text-hub-text dark:text-gray-100 mb-3">
                  {frontmatter.title}
                </h1>
              )}

              {frontmatter.description && (
                <p className="text-lg text-hub-muted dark:text-gray-400 mb-5 leading-relaxed">
                  {frontmatter.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm text-hub-muted dark:text-gray-400 mb-4">
                {frontmatter.duration && <span>{frontmatter.duration} min</span>}
                {frontmatter.author && <span>{frontmatter.author}</span>}
                {frontmatter.difficulty && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyColors[frontmatter.difficulty]}`}>
                    {toTitleCase(frontmatter.difficulty)}
                  </span>
                )}
              </div>

              {frontmatter.tags && frontmatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {frontmatter.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getTagColor(tag)}`}
                    >
                      {toTitleCase(tag)}
                    </span>
                  ))}
                </div>
              )}
            </header>
          </div>
        )}

        <ComponentRegistryProvider>
          <article className="max-w-4xl mx-auto px-6 py-8 prose prose-lg max-w-none dark:prose-invert">
            {children}
          </article>
        </ComponentRegistryProvider>
      </main>

      {/* Fixed footer navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-hub-surface/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-black/[0.08] dark:border-white/10 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => goToPage(currentPageIndex - 1, 'previous')}
            disabled={!canGoPrev}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${canGoPrev
                ? 'bg-hub-surface-alt dark:bg-white/10 text-hub-text dark:text-gray-200 hover:bg-black/[0.06] dark:hover:bg-white/15 border border-black/[0.08] dark:border-white/15'
                : 'bg-transparent text-hub-muted dark:text-gray-600 cursor-not-allowed'
              }
            `}
          >
            ← Previous
          </button>

          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-hub-muted dark:text-gray-400 hover:text-hub-text dark:hover:text-gray-200 transition-colors"
              aria-label="Toggle progress sidebar"
            >
              ☰
            </button>
            {adminMode && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 font-medium">
                Admin
              </span>
            )}
            <span className="text-sm text-hub-muted dark:text-gray-400">
              <span className="font-mono">Page {currentPageIndex + 1} of {totalPages}</span>
              {minutesRemaining !== null && minutesRemaining > 0 && (
                <span className="ml-1">&middot; ~{minutesRemaining} min remaining</span>
              )}
              {isLastPage && effectiveAllAnswered && (
                <span className="ml-1 text-green-500 dark:text-green-400">&middot; Complete!</span>
              )}
            </span>
          </div>

          <button
            onClick={() => canGoNext && goToPage(currentPageIndex + 1, 'next')}
            disabled={!canGoNext}
            aria-disabled={!canGoNext}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
              ${canGoNext
                ? 'bg-hub-primary text-white hover:bg-hub-primary-dark shadow-sm hover:shadow'
                : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }
            `}
          >
            {isLastPage ? 'Done' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
