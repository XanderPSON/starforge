import { getTrainingPage } from '@/lib/mdx'
import { notFound } from 'next/navigation'
import TrainingViewer from '@/components/TrainingViewer'

interface TrainingPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

export default async function TrainingPage({ params, searchParams }: TrainingPageProps) {
  const { slug } = await params
  const { page } = await searchParams

  const rawIndex = page ? parseInt(page, 10) : 0
  const pageIndex = isNaN(rawIndex) || rawIndex < 0 ? 0 : rawIndex

  let result
  try {
    result = await getTrainingPage(slug, pageIndex)
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      notFound()
    }
    throw error
  }

  if (result === null) {
    notFound()
  }

  const { content, frontmatter, totalPages, pageHeading, sidebarGroups, requiredIds } = result

  return (
    <TrainingViewer
      slug={slug}
      currentPageIndex={pageIndex}
      totalPages={totalPages}
      pageHeading={pageHeading}
      sidebarGroups={sidebarGroups}
      requiredIds={requiredIds}
      showHeader={pageIndex === 0}
      pageExplicitlyRequested={page !== undefined}
      frontmatter={frontmatter}
    >
      {content}
    </TrainingViewer>
  )
}
