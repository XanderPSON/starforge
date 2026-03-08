interface LinkProps {
  href?: string
  children: React.ReactNode
}

export function Link({ href, children }: LinkProps) {
  return (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="text-blue-500 underline underline-offset-2 hover:text-blue-700 transition-colors"
    >
      {children}
    </a>
  )
}
