import { listTrainings } from '@/lib/mdx'
import { TrainingCatalog } from '@/components/TrainingCatalog'

export default async function Home() {
  const trainings = await listTrainings()
  const platformName = process.env.PLATFORM_NAME || 'Training Hub'

  return (
    <main className="min-h-screen bg-hub-bg dark:bg-transparent">
      <header className="hub-hero border-b border-black/[0.08] dark:border-white/10 px-6 md:px-12 py-8">
        <h1 className="text-3xl font-bold text-hub-text dark:text-gray-100 mb-1">{platformName}</h1>
        <p className="text-hub-muted dark:text-gray-400">Interactive learning experiences powered by Markdown</p>
      </header>

      <div className="px-6 md:px-12 py-8">
        <TrainingCatalog trainings={trainings} />
      </div>
    </main>
  )
}
