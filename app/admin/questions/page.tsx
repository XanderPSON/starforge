import { listTrainings } from '@/lib/mdx'
import { getResponseDistribution } from '@/lib/admin-queries'
import { ResponseTable } from '@/components/admin/ResponseTable'
import { DistributionChart } from '@/components/admin/charts/DistributionChart'
import { getPrisma } from '@/lib/prisma'

interface AdminQuestionsPageProps {
  searchParams: Promise<{ slug?: string; componentId?: string }>
}

export default async function AdminQuestionsPage({ searchParams }: AdminQuestionsPageProps) {
  const { slug, componentId } = await searchParams

  const trainings = await listTrainings()

  const availableComponents = await (async () => {
    if (!slug) return []
    const prisma = getPrisma()
    if (!prisma) return []

    return prisma.interactionResponse.groupBy({
      by: ['componentId'],
      where: { slug },
      _count: { _all: true },
      orderBy: { componentId: 'asc' },
    })
  })()

  const distribution = slug && componentId
    ? await getResponseDistribution(slug, componentId)
    : null

  const isLikelyMultipleChoice = Boolean(
    distribution &&
      distribution.distribution.length > 0 &&
      distribution.distribution.every((entry) => entry.valueLabel.length <= 120)
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-hub-text dark:text-gray-100">Question Analytics</h1>
        <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">Inspect response patterns by training and component.</p>
      </header>

      <form className="grid grid-cols-1 gap-3 rounded-xl border border-black/[0.08] bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto] dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
        <select
          name="slug"
          defaultValue={slug ?? ''}
          className="rounded-lg border border-black/[0.1] bg-white px-3 py-2 text-sm text-hub-text outline-none focus:border-hub-primary dark:border-white/20 dark:bg-white/10 dark:text-gray-100 dark:focus:border-blue-400"
        >
          <option value="">Select training</option>
          {trainings.map((training) => (
            <option key={training.slug} value={training.slug}>
              {training.frontmatter.title ?? training.slug}
            </option>
          ))}
        </select>

        <select
          name="componentId"
          defaultValue={componentId ?? ''}
          disabled={!slug}
          className="rounded-lg border border-black/[0.1] bg-white px-3 py-2 text-sm text-hub-text outline-none focus:border-hub-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/20 dark:bg-white/10 dark:text-gray-100 dark:focus:border-blue-400"
        >
          <option value="">Select component</option>
          {availableComponents.map((component) => (
            <option key={component.componentId} value={component.componentId}>
              {component.componentId} ({component._count._all})
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-lg bg-hub-primary px-4 py-2 text-sm font-medium text-white hover:bg-hub-primary-dark dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Analyze
        </button>
      </form>

      {distribution && (
        <section className="space-y-4">
          <div className="rounded-xl border border-black/[0.08] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-hub-text dark:text-gray-100">Distribution</h2>
            <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">
              {distribution.totalResponses} total responses for <span className="font-mono">{distribution.componentId}</span>
            </p>

            {distribution.distribution.length === 0 ? (
              <p className="mt-4 text-sm text-hub-muted dark:text-gray-400">No responses submitted yet.</p>
            ) : (
              <div className="mt-4 space-y-2">
                <DistributionChart
                  data={distribution.distribution.map((entry) => ({
                    label: entry.valueLabel,
                    count: entry.count,
                    percentage: entry.percentage,
                  }))}
                />

                {isLikelyMultipleChoice && (
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-hub-muted dark:text-gray-400">
                    Multiple choice answer frequency
                  </p>
                )}
                {distribution.distribution.map((entry) => (
                  <div key={entry.valueLabel} className="rounded-lg border border-black/[0.06] px-3 py-2 dark:border-white/10">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-hub-text dark:text-gray-100">{entry.valueLabel}</p>
                      <p className="text-xs text-hub-muted dark:text-gray-400">
                        {entry.count} ({entry.percentage}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ResponseTable responses={distribution.responses} />
        </section>
      )}
    </div>
  )
}
