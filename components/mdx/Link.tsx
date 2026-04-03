interface LinkProps {
  href?: string
  children: React.ReactNode
}

export function Link({ href, children }: LinkProps) {
  const isExternal = href?.startsWith('http')

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={isExternal ? 'Opens in new tab' : undefined}
      title={isExternal ? 'Opens in new tab' : undefined}
      className="text-blue-500 underline underline-offset-2 hover:text-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded"
    >
      {children}
    </a>
  )
}
