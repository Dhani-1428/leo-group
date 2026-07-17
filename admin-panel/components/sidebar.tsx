'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Boxes, ShoppingCart, Users, BarChart3, FileText, LogOut } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/stock', label: 'Stock Management', icon: Boxes },
    { href: '/users', label: 'Users & Team', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/reports', label: 'Reports', icon: FileText },
  ]

  return (
    <div className="w-64 bg-[#1a1a1a] hairline-subtle border-r min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b hairline-subtle">
        <h1 className="text-heading text-[#c89b5c]">LEO</h1>
        <p className="text-code text-[#a8a8a8] mt-1">WORLD</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
                  isActive
                    ? 'bg-[#c89b5c] text-[#0a0a0a] font-medium'
                    : 'text-[#a8a8a8] hover:text-foreground hover:bg-[#2a2a2a]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t hairline-subtle">
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('adminSession')
            window.location.href = '/login'
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-[#a8a8a8] hover:text-foreground hover:bg-[#2a2a2a] rounded-none transition-colors text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
