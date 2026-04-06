import { listTrainings } from '@/lib/mdx'
import { TrainingCatalog } from '@/components/TrainingCatalog'

export default async function Home() {
  const trainings = await listTrainings()

  return (
    <main className="min-h-screen bg-hub-bg dark:bg-transparent">
      {/* Logo hero */}
      <div className="px-6 md:px-12 pt-10 pb-6">
        <div className="flex items-center justify-center gap-5">
          {/* Star icon */}
          <div className="relative flex-shrink-0 w-[72px] h-[72px]">
            {/* Glow blob */}
            <div className="absolute inset-1 rounded-full bg-[#27466A] blur-xl opacity-40 dark:opacity-60" />
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
                <linearGradient id="sfOrbitGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2D4E76" />
                  <stop offset="100%" stopColor="#9DB4CF" />
                </linearGradient>
                <linearGradient id="sfCoreGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7F99BC" />
                  <stop offset="100%" stopColor="#E3EDF8" />
                </linearGradient>
                <radialGradient id="sfHexCore" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16 16) rotate(90) scale(8)">
                  <stop offset="0%" stopColor="#162844" />
                  <stop offset="100%" stopColor="#0C172C" />
                </radialGradient>
              </defs>
              <circle cx="16" cy="16" r="11.25" stroke="url(#sfOrbitGrad)" strokeWidth="1.35" opacity="0.75" />
              <ellipse
                cx="16"
                cy="16"
                rx="13"
                ry="5.15"
                transform="rotate(-28 16 16)"
                stroke="url(#sfOrbitGrad)"
                strokeWidth="1.1"
                opacity="0.7"
              />
              <ellipse
                cx="16"
                cy="16"
                rx="13"
                ry="5.15"
                transform="rotate(28 16 16)"
                stroke="url(#sfOrbitGrad)"
                strokeWidth="1.1"
                opacity="0.55"
              />
              <polygon
                points="16,9.2 21.2,12.2 21.2,18.2 16,21.2 10.8,18.2 10.8,12.2"
                fill="url(#sfHexCore)"
                stroke="#6283A8"
                strokeWidth="1"
                opacity="0.95"
              />
              <path
                d="M16 6.2L17.85 12.8L24.5 14.65L17.85 16.5L16 23.1L14.15 16.5L7.5 14.65L14.15 12.8Z"
                fill="url(#sfCoreGrad)"
              />
              <path d="M16 4.9V7.2M27.1 16H24.8M16 27.1V24.8M4.9 16H7.2" stroke="#AFC2D8" strokeWidth="1" strokeLinecap="round" opacity="0.82" />
            </svg>
          </div>

          {/* Wordmark */}
          <div>
            <span
              className="block text-5xl md:text-6xl font-black tracking-[0.08em] leading-none uppercase bg-gradient-to-r from-[#335B86] via-[#9CB5D1] to-[#E3EDF8] bg-clip-text text-transparent select-none"
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
