'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  LogOut,
  Sparkles,
  Cpu,
} from 'lucide-react'

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

  const productsOpen = pathname === '/products' || pathname.startsWith('/products/')

  return (
    <div className="w-64 bg-[#1a1a1a] hairline-subtle border-r min-h-screen flex flex-col">
      <div className="p-6 border-b hairline-subtle">
        <h1 className="text-heading text-[#c89b5c]">LEO</h1>
        <p className="text-code text-[#a8a8a8] mt-1">WORLD</p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/products'
                ? pathname === '/products'
                : pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <div key={item.href}>
                <Link
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

                {item.href === '/products' && productsOpen && (
                  <div className="mt-1 mb-2 ml-4 space-y-1 border-l border-[#333] pl-3">
                    <Link
                      href="/products/create/perfume"
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                        pathname.startsWith('/products/create/perfume')
                          ? 'text-[#c89b5c]'
                          : 'text-[#a8a8a8] hover:text-[#c89b5c]'
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      Add Perfume
                    </Link>
                    <Link
                      href="/products/create/tech"
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                        pathname.startsWith('/products/create/tech')
                          ? 'text-[#c89b5c]'
                          : 'text-[#a8a8a8] hover:text-[#c89b5c]'
                      }`}
                    >
                      <Cpu className="h-4 w-4" />
                      Add Tech
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

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
