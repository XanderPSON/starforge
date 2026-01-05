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
      <article className="max-w-4xl mx-auto px-6 py-12" role="article">
        {frontmatter?.title && (
          <header className="mb-8" role="banner">
            <h1 className="text-4xl font-bold mb-2">{frontmatter.title}</h1>
            {frontmatter.description && (
              <p className="text-lg text-gray-600">{frontmatter.description}</p>
            )}
            {frontmatter.duration && (
              <p className="text-sm text-gray-500 mt-2">
                Duration: {frontmatter.duration} minutes
              </p>
            )}
          </header>
        )}
        <section className="prose prose-lg max-w-none" role="main">
          {content}
        </section>
      </article>
    )
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      notFound()
    }
    throw error
  }
}
