'use client'

import { useState, useMemo, useEffect } from 'react'
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
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map(({ slug, frontmatter }) => (
            <a
              key={slug}
              href={`/training/${slug}`}
              className={`relative flex flex-col bg-hub-surface dark:bg-white/5 dark:backdrop-blur-sm rounded-2xl p-5 border shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 group ${
                completedSlugs.has(slug)
                  ? 'border-green-400/40 dark:border-green-500/30'
                  : 'border-black/[0.08] dark:border-white/10'
              }`}
            >
              {completedSlugs.has(slug) && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/15 px-2 py-0.5 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Done
                </span>
              )}
              {frontmatter.tags && frontmatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
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
              <h3 className="text-sm font-semibold text-hub-text dark:text-gray-200 group-hover:text-hub-primary dark:group-hover:text-blue-400 transition-colors leading-snug mb-2">
                {frontmatter.title || toTitleCase(slug)}
              </h3>

              {/* Description */}
              {frontmatter.description && (
                <p className="text-hub-muted dark:text-gray-400 text-xs leading-relaxed flex-1 mb-4">
                  {frontmatter.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-hub-muted dark:text-gray-500 mt-auto pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
                <div className="flex items-center gap-2 flex-wrap">
                  {frontmatter.difficulty && (
                    <span className={`px-2 py-0.5 rounded-full border font-medium ${difficultyColors[frontmatter.difficulty]}`}>
                      {toTitleCase(frontmatter.difficulty)}
                    </span>
                  )}
                  {frontmatter.duration && <span>{frontmatter.duration} min</span>}
                  {frontmatter.author && <span className="truncate max-w-[120px]">{frontmatter.author}</span>}
                </div>
                <span className="text-hub-primary dark:text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
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
