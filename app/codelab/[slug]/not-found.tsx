import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Codelab Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          The codelab you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
