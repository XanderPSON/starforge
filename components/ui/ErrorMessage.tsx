import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  title: string
  message: string
  details?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function ErrorMessage({
  title,
  message,
  details,
  action,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn('max-w-2xl mx-auto text-center glass-effect p-12 rounded-2xl border-red-500/30', className)}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-4xl font-bold mb-4 text-red-600 dark:text-red-400">{title}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      {details && (
        <pre className="bg-gray-100 dark:bg-coinbase-dark/80 p-6 rounded-xl text-left text-sm overflow-x-auto mb-8 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-coinbase-blue/30">
          {details}
        </pre>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-8 py-3 bg-coinbase-gradient text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-200 glow-blue focus:outline-none focus:ring-2 focus:ring-coinbase-blue focus:ring-offset-2 focus:ring-offset-coinbase-dark-bg"
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
