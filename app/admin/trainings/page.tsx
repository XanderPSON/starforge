import Link from 'next/link'
import { getTrainingCompletionRates } from '@/lib/admin-queries'

export default async function AdminTrainingsPage() {
  const trainings = await getTrainingCompletionRates()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-hub-text dark:text-gray-100">Training Analytics</h1>
        <p className="mt-1 text-sm text-hub-muted dark:text-gray-400">Completion and response health by training slug.</p>
      </header>

      <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-black/[0.08] bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Training</th>
                <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Completion Rate</th>
                <th className="px-4 py-3 text-left font-semibold text-hub-text dark:text-gray-200">Response Count</th>
              </tr>
            </thead>
            <tbody>
              {trainings.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-hub-muted dark:text-gray-400">
                    No training analytics available yet.
                  </td>
                </tr>
              ) : (
                trainings.map((training) => (
                  <tr key={training.slug} className="border-t border-black/[0.06] dark:border-white/10">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/trainings/${training.slug}`}
                        className="font-medium text-hub-primary hover:underline dark:text-blue-300"
                      >
                        {training.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-hub-text dark:text-gray-100">
                      {training.completionRate}% ({training.completions}/{training.totalUsers})
                    </td>
                    <td className="px-4 py-3 text-hub-muted dark:text-gray-300">{training.responseCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
