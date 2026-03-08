interface StatsCardProps {
  title: string
  value: string | number
  description?: string
}

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <section className="rounded-xl border border-black/[0.08] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-hub-muted dark:text-gray-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-hub-text dark:text-gray-100">{value}</p>
      {description && <p className="mt-2 text-sm text-hub-muted dark:text-gray-400">{description}</p>}
    </section>
  )
}
