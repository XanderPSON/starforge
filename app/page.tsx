import { listCodelabs } from '@/lib/mdx'

export default async function Home() {
  const codelabs = await listCodelabs()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
              MDX Codelab Viewer
            </div>
            <div className="h-1 bg-coinbase-gradient rounded-full"></div>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Interactive learning experiences powered by Markdown
          </p>

          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            Transform your local Markdown files into beautiful, interactive codelabs with persistent state and professional styling
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="glass-effect p-6 rounded-2xl glow-blue-hover transition-all duration-300">
            <div className="text-coinbase-blue text-3xl mb-3">🚀</div>
            <h3 className="text-xl font-semibold text-white mb-2">Local-First</h3>
            <p className="text-gray-400 text-sm">
              All content lives on your machine. No servers, no databases, complete privacy.
            </p>
          </div>

          <div className="glass-effect p-6 rounded-2xl glow-blue-hover transition-all duration-300">
            <div className="text-coinbase-blue text-3xl mb-3">💾</div>
            <h3 className="text-xl font-semibold text-white mb-2">Auto-Save</h3>
            <p className="text-gray-400 text-sm">
              Your responses persist across sessions with debounced localStorage.
            </p>
          </div>

          <div className="glass-effect p-6 rounded-2xl glow-blue-hover transition-all duration-300">
            <div className="text-coinbase-blue text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Hot Reload</h3>
            <p className="text-gray-400 text-sm">
              Edit your Markdown files and see changes instantly in the browser.
            </p>
          </div>

          <div className="glass-effect p-6 rounded-2xl glow-blue-hover transition-all duration-300">
            <div className="text-coinbase-blue text-3xl mb-3">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-2">Modern Design</h3>
            <p className="text-gray-400 text-sm">
              Professional styling with Coinbase branding and interstellar aesthetics.
            </p>
          </div>
        </div>

        {/* Available Codelabs */}
        <div className="glass-effect p-8 rounded-2xl border-coinbase-blue/30">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Available Codelabs</h2>
          <div className="grid gap-4">
            {codelabs.map(({ slug, frontmatter }) => (
              <a
                key={slug}
                href={`/codelab/${slug}`}
                className="block glass-effect p-5 rounded-xl hover:scale-[1.02] transition-all duration-200 glow-blue-hover group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-coinbase-cyan transition-colors">
                      {frontmatter.title || slug}
                    </h3>
                    {frontmatter.description && (
                      <p className="text-gray-400 text-sm mt-1">{frontmatter.description}</p>
                    )}
                    {frontmatter.tags && frontmatter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {frontmatter.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-coinbase-blue/10 text-coinbase-cyan border border-coinbase-blue/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-sm text-gray-500">
                    {frontmatter.duration && (
                      <span>{frontmatter.duration} min</span>
                    )}
                    <span className="text-coinbase-blue group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
