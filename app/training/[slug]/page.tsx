import { getTraining } from '@/lib/mdx'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface TrainingPageProps {
  params: Promise<{
    slug: string
  }>
}

function toTitleCase(str: string): string {
  return str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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

export default async function TrainingPage({ params }: TrainingPageProps) {
  const { slug } = await params

  let training
  try {
    training = await getTraining(slug)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      notFound()
    }
    throw error
  }

  if (training === null) {
    notFound()
  }

  const { content, frontmatter } = training

  return (
    <div className="min-h-screen bg-hub-bg dark:bg-transparent">
      <article className="max-w-4xl mx-auto px-6 py-12" role="article">
        <header className="mb-10 bg-hub-surface dark:bg-white/5 dark:backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-white/10 shadow-sm p-8" role="banner">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-hub-muted dark:text-gray-400 hover:text-hub-primary dark:hover:text-blue-400 transition-colors mb-6"
          >
            ← All Trainings
          </Link>

          {frontmatter?.title && (
            <h1 className="text-4xl font-bold text-hub-text dark:text-gray-100 mb-3">
              {frontmatter.title}
            </h1>
          )}

          {frontmatter?.description && (
            <p className="text-lg text-hub-muted dark:text-gray-400 mb-5 leading-relaxed">{frontmatter.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-hub-muted dark:text-gray-400 mb-4">
            {frontmatter?.duration && <span>{frontmatter.duration} min</span>}
            {frontmatter?.author && <span>{frontmatter.author}</span>}
            {frontmatter?.difficulty && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyColors[frontmatter.difficulty]}`}>
                {toTitleCase(frontmatter.difficulty)}
              </span>
            )}
          </div>

          {frontmatter?.tags && frontmatter.tags.length > 0 && (
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

        <section className="prose prose-lg max-w-none dark:prose-invert" role="main">
          {content}
        </section>
      </article>
    </div>
  )
}
