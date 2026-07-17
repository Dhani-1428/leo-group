import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: 'signature' | 'tech'
  change?: {
    value: number
    direction: 'up' | 'down'
  }
}

export function StatCard({ label, value, icon: Icon, accent = 'signature', change }: StatCardProps) {
  const accentColor = accent === 'signature' ? '#c89b5c' : '#7c9cb4'

  return (
    <div className="bg-[#1a1a1a] hairline p-6">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-none hairline flex items-center justify-center"
          style={{ borderColor: accentColor }}
        >
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
        {change && (
          <div
            className="text-xs font-medium"
            style={{ color: change.direction === 'up' ? '#6b9e5f' : '#a85c5c' }}
          >
            {change.direction === 'up' ? '+' : '−'}{change.value}%
          </div>
        )}
      </div>
      <p className="text-body-small text-[#a8a8a8] mb-1">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}
