import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="max-w-2xl text-center glass-effect p-12 rounded-2xl border-coinbase-blue/30">
        <div className="text-6xl mb-6">🌌</div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
          Training Not Found
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          The training you&apos;re looking for doesn&apos;t exist in this universe.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-coinbase-gradient text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-200 glow-blue"
        >
          Return to All Trainings
        </Link>
      </div>
    </div>
  )
}
