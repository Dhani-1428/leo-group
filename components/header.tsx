'use client'

import { User, Settings, Bell } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="bg-[#1a1a1a] hairline border-b">
      <div className="px-8 py-6 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-heading text-foreground">{title}</h2>
          {subtitle && <p className="text-body-small text-[#a8a8a8] mt-1">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center gap-4">{actions}</div>}

        {!actions && (
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#2a2a2a] rounded-none transition-colors">
              <Bell className="w-5 h-5 text-[#a8a8a8]" />
            </button>
            <button className="p-2 hover:bg-[#2a2a2a] rounded-none transition-colors">
              <Settings className="w-5 h-5 text-[#a8a8a8]" />
            </button>
            <div className="w-10 h-10 rounded-full bg-[#2a2a2a] hairline flex items-center justify-center">
              <User className="w-5 h-5 text-[#a8a8a8]" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
