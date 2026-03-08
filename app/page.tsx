import { listTrainings } from '@/lib/mdx'
import { TrainingCatalog } from '@/components/TrainingCatalog'

export default async function Home() {
  const trainings = await listTrainings()

  return (
    <main className="min-h-screen bg-hub-bg dark:bg-transparent">
      {/* Logo hero */}
      <div className="px-6 md:px-12 pt-10 pb-6">
        <div className="flex items-center gap-5">
          {/* Star icon */}
          <div className="relative flex-shrink-0 w-[72px] h-[72px]">
            {/* Glow blob */}
            <div className="absolute inset-1 rounded-full bg-[#4c5bff] blur-xl opacity-40 dark:opacity-60" />
            <svg
              width="72"
              height="72"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="sfStarGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4c5bff" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <polygon
                points="16,3 19.23,11.55 28.37,11.98 21.23,17.70 23.64,26.52 16,21.5 8.36,26.52 10.77,17.70 3.63,11.98 12.77,11.55"
                fill="url(#sfStarGrad)"
              />
            </svg>
            {/* Cyan sparkle — top right */}
            <svg
              className="absolute -top-2 -right-2"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 0 L8.4 5.6 L14 7 L8.4 8.4 L7 14 L5.6 8.4 L0 7 L5.6 5.6 Z"
                fill="#06B6D4"
              />
            </svg>
            {/* Blue sparkle — bottom left */}
            <svg
              className="absolute -bottom-1 -left-1"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z"
                fill="#4c5bff"
                opacity="0.75"
              />
            </svg>
          </div>

          {/* Wordmark */}
          <div>
            <span
              className="block text-5xl md:text-6xl font-black tracking-[0.08em] leading-none uppercase bg-gradient-to-r from-[#4c5bff] via-[#7c3aed] to-[#06B6D4] bg-clip-text text-transparent select-none"
              aria-label="Starforge"
            >
              STARFORGE
            </span>
            <span className="block mt-2 text-xs font-semibold tracking-[0.22em] uppercase text-hub-muted dark:text-gray-400">
              Interactive engineering training hub
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-6">
        <TrainingCatalog trainings={trainings} />
      </div>
    </main>
  )
}
