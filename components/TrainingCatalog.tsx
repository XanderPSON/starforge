'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { TrainingFrontmatter } from '@/lib/mdx'
import { safeGetItem } from '@/lib/storage'
import { toTitleCase } from '@/lib/utils'

interface Training {
  slug: string
  frontmatter: TrainingFrontmatter
}

interface TrainingCatalogProps {
  trainings: Training[]
}

// Each entry includes both light and dark variants so Tailwind can detect them statically
const TAG_COLORS = [
  'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30',
  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30',
  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
  'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
  'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30',
  'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30',
]

function getTagColor(tag: string): string {
  let hash = 0
  for (const ch of tag) hash = (hash * 31 + ch.charCodeAt(0)) % TAG_COLORS.length
  return TAG_COLORS[hash]!
}

const difficultyColors = {
  beginner:     'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30',
  intermediate: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  advanced:     'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
}

const PAGE_SIZE = 24

export function TrainingCatalog({ trainings }: TrainingCatalogProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set())
  const [activatingSlug, setActivatingSlug] = useState<string | null>(null)
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.button !== 0) return
    e.preventDefault()
    if (activatingSlug) return
    setActivatingSlug(slug)
    setTimeout(() => {
      router.push(`/training/${slug}`)
    }, 500)
  }

  useEffect(() => {
    const completed = new Set<string>()
    for (const { slug } of trainings) {
      if (safeGetItem(`codelab:${slug}:__completed`) === true) {
        completed.add(slug)
      }
    }
    setCompletedSlugs(completed)
  }, [trainings])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const { frontmatter } of trainings) {
      frontmatter.tags?.forEach((t) => tagSet.add(t))
    }
    return Array.from(tagSet).sort()
  }, [trainings])

  const filtered = useMemo(() => {
    setPage(0)
    return trainings
      .filter((t) => !activeTag || t.frontmatter.tags?.includes(activeTag))
      .filter(
        (t) =>
          !search ||
          [t.frontmatter.title, t.frontmatter.description]
            .join(' ')
            .toLowerCase()
            .includes(search.toLowerCase())
      )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainings, activeTag, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div>
      {/* Stats + Search row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <p className="text-sm text-hub-muted dark:text-gray-400 shrink-0">
          {filtered.length} training{filtered.length !== 1 ? 's' : ''}
          {allTags.length > 0 && `, ${allTags.length} topics`}
        </p>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search trainings..."
          className="flex-1 px-4 py-2.5 bg-hub-surface dark:bg-white/5 rounded-xl border border-black/[0.08] dark:border-white/10 text-hub-text dark:text-gray-200 placeholder:text-hub-muted dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-hub-primary/20 dark:focus:ring-blue-500/20 focus:border-hub-primary/40 dark:focus:border-blue-500/40 shadow-sm text-sm transition-shadow"
        />
      </div>

      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150 ${
              activeTag === null
                ? 'bg-hub-primary dark:bg-blue-500 text-white border-hub-primary dark:border-blue-500 shadow-sm'
                : 'bg-hub-surface dark:bg-white/5 text-hub-muted dark:text-gray-400 border-black/[0.08] dark:border-white/10 hover:text-hub-text dark:hover:text-gray-200 hover:border-black/20 dark:hover:border-white/20'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150 ${
                activeTag === tag
                  ? `${getTagColor(tag)} shadow-sm`
                  : 'bg-hub-surface dark:bg-white/5 text-hub-muted dark:text-gray-400 border-black/[0.08] dark:border-white/10 hover:text-hub-text dark:hover:text-gray-200 hover:border-black/20 dark:hover:border-white/20'
              }`}
            >
              {toTitleCase(tag)}
            </button>
          ))}
        </div>
      )}

      {/* Training grid */}
      {paginated.length === 0 ? (
        <p className="text-center text-hub-muted dark:text-gray-500 py-16">No trainings match your filters.</p>
      ) : (
        <div className={`grid ${filtered.length <= 6 ? 'gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {paginated.map(({ slug, frontmatter }) => (
            <a
              key={slug}
              href={`/training/${slug}`}
              onClick={(e) => handleCardClick(e, slug)}
              className={`training-card-shimmer ${activatingSlug === slug ? 'card-launching' : ''} group relative isolate flex flex-col overflow-hidden rounded-2xl border ${filtered.length <= 6 ? 'p-8 min-h-[220px]' : 'p-5'} bg-hub-surface dark:bg-[#0C172C]/75 dark:backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-18px_rgba(22,40,68,0.55)] dark:hover:shadow-[0_22px_40px_-20px_rgba(157,180,207,0.35)] ${
                completedSlugs.has(slug)
                  ? 'border-green-400/40 dark:border-green-500/30'
                  : 'border-black/[0.08] dark:border-white/10 hover:border-[#335B86]/50 dark:hover:border-[#9DB4CF]/30'
              }`}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-px rounded-[15px] border border-white/40 dark:border-white/[0.06] transition-colors duration-300 group-hover:border-[#9DB4CF]/45 dark:group-hover:border-[#AFC2D8]/25"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_88%_8%,rgba(157,180,207,0.22),transparent_52%)] dark:bg-[radial-gradient(circle_at_85%_5%,rgba(45,78,118,0.45),transparent_52%)] opacity-80"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-4 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-[#9DB4CF] via-[#335B86] to-[#2D4E76] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              />

              {completedSlugs.has(slug) && (
                <span className="absolute top-3 right-3 z-20 flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/15 px-2 py-0.5 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Done
                </span>
              )}
              <div className="relative z-10 flex flex-1 flex-col">
                <div className="mb-3 space-y-3">
                  {frontmatter.tags && frontmatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {frontmatter.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getTagColor(tag)}`}
                        >
                          {toTitleCase(tag)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className={`${filtered.length <= 6 ? 'text-xl' : 'text-base'} font-semibold tracking-[0.01em] text-hub-text dark:text-[#E3EDF8] leading-snug transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#E3EDF8] group-hover:to-[#9DB4CF] group-hover:bg-clip-text`}>
                    {frontmatter.title || toTitleCase(slug)}
                  </h3>
                </div>

                {/* Description */}
                {frontmatter.description && (
                  <p className={`text-hub-muted dark:text-[#AFC2D8]/85 ${filtered.length <= 6 ? 'text-base' : 'text-xs'} leading-relaxed flex-1 mb-4`}>
                    {frontmatter.description}
                  </p>
                )}

                {/* Launch rail */}
                <div className={`mt-auto relative flex items-center overflow-hidden rounded-xl border border-black/[0.05] dark:border-white/[0.08] bg-black/[0.02] dark:bg-[#162844]/35 pl-12 pr-3 ${filtered.length <= 6 ? 'py-3 text-sm' : 'py-2 text-xs'} text-hub-muted dark:text-gray-400`}>
                  <span
                    className={`chevron-rumble absolute top-1/2 -translate-y-1/2 z-10 inline-flex items-center rounded-full border border-[#2D4E76]/30 bg-[#2D4E76]/10 px-2 py-1 text-[#335B86] dark:border-[#9DB4CF]/20 dark:bg-[#9DB4CF]/10 dark:text-[#AFC2D8] transition-[left,background-color,border-color,color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:border-[#9DB4CF]/45 group-hover:bg-[#27466A]/30 group-hover:text-[#E3EDF8] ${
                      activatingSlug === slug ? 'left-[calc(100%-2.5rem)]' : 'left-3'
                    }`}
                  >
                    <svg className="h-3 w-3" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M4 3.5L7.5 7L4 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7.5 3.5L11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div className="flex items-center gap-2 flex-wrap ml-auto">
                    {frontmatter.duration && (
                      <span className="px-2 py-0.5 rounded-full border font-medium bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
                        {frontmatter.duration} min
                      </span>
                    )}

                    {frontmatter.difficulty && (
                      <span className={`px-2 py-0.5 rounded-full border font-medium ${difficultyColors[frontmatter.difficulty]}`}>
                        {toTitleCase(frontmatter.difficulty)}
                      </span>
                    )}

                    {frontmatter.author && <span className="truncate max-w-[120px]">{frontmatter.author}</span>}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm bg-hub-surface dark:bg-white/5 rounded-xl border border-black/[0.08] dark:border-white/10 text-hub-muted dark:text-gray-400 hover:text-hub-primary dark:hover:text-blue-400 hover:border-hub-primary/30 dark:hover:border-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            ← Previous
          </button>
          <span className="text-sm text-hub-muted dark:text-gray-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 text-sm bg-hub-surface dark:bg-white/5 rounded-xl border border-black/[0.08] dark:border-white/10 text-hub-muted dark:text-gray-400 hover:text-hub-primary dark:hover:text-blue-400 hover:border-hub-primary/30 dark:hover:border-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
