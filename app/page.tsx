export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">MDX Codelab Viewer</h1>
        <p className="text-lg text-gray-600 mb-8">
          View local Markdown files as interactive codelabs
        </p>
        <p className="text-sm text-gray-500">
          Navigate to <code className="bg-gray-100 px-2 py-1 rounded">/codelab/[filename]</code> to view a codelab
        </p>
      </div>
    </main>
  )
}
