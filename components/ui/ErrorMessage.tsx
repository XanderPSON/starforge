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
      className={cn('max-w-2xl mx-auto text-center p-8', className)}
      role="alert"
      aria-live="assertive"
    >
      <h1 className="text-4xl font-bold mb-4 text-red-600">{title}</h1>
      <p className="text-lg text-gray-600 mb-4">{message}</p>
      {details && (
        <pre className="bg-gray-100 p-4 rounded-lg text-left text-sm overflow-x-auto mb-8 text-gray-800">
          {details}
        </pre>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
