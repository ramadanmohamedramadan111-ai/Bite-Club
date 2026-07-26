import { ReactNode } from 'react'
import { StatCard } from './StatCard'

interface StatsGridCard {
  label: string
  value: string
  change?: string
  direction?: 'up' | 'down'
  icon: string
  iconBg: string
}

interface StatsGridProps {
  cards: StatsGridCard[]
}

export function StatsGrid({ cards }: StatsGridProps) {
  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  )
}
