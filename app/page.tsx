export default function Home() {
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

        {/* CTA Section */}
        <div className="glass-effect p-8 rounded-2xl border-coinbase-blue/30 text-center">
          <p className="text-gray-300 mb-4">
            Try the sample codelabs to see it in action
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/codelab/demo"
              className="px-8 py-3 bg-coinbase-gradient text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-200 glow-blue"
            >
              View Demo Codelab
            </a>
            <a
              href="/codelab/intro"
              className="px-8 py-3 glass-effect text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-200"
            >
              Introduction Guide
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Or navigate to <code className="bg-coinbase-space text-coinbase-cyan px-3 py-1 rounded-md border border-coinbase-blue/30">/codelab/[filename]</code>
          </p>
        </div>
      </div>
    </main>
  )
}
