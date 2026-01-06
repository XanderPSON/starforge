import { getCodelab } from '@/lib/mdx'
import { notFound } from 'next/navigation'

interface CodelabPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CodelabPage({ params }: CodelabPageProps) {
  const { slug } = await params

  try {
    const { content, frontmatter } = await getCodelab(slug)

    return (
      <div className="min-h-screen">
        <article className="max-w-5xl mx-auto px-6 py-12" role="article">
          {frontmatter?.title && (
            <header className="mb-12 glass-effect p-8 rounded-2xl border-coinbase-blue/30" role="banner">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                {frontmatter.title}
              </h1>
              {frontmatter.description && (
                <p className="text-xl text-gray-300 mb-4 leading-relaxed">{frontmatter.description}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-400">
                {frontmatter.duration && (
                  <span className="flex items-center gap-2">
                    <span className="text-coinbase-cyan">⏱</span>
                    {frontmatter.duration} minutes
                  </span>
                )}
                {frontmatter.author && (
                  <span className="flex items-center gap-2">
                    <span className="text-coinbase-cyan">👤</span>
                    {frontmatter.author}
                  </span>
                )}
              </div>
            </header>
          )}
          <section className="prose prose-lg max-w-none prose-invert" role="main">
            {content}
          </section>
        </article>
      </div>
    )
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      notFound()
    }
    throw error
  }
}
