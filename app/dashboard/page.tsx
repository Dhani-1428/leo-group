'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { StatCard } from '@/components/stat-card'
import { ShoppingBag, TrendingUp, AlertCircle, Clock } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/login')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  if (!isAuthed) return null

  return (
    <LayoutWrapper>
      <Header
        title="Dashboard"
        subtitle="Welcome back to LEO WORLD administration"
      />

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Products"
            value="248"
            icon={ShoppingBag}
            accent="signature"
            change={{ value: 12, direction: 'up' }}
          />
          <StatCard
            label="In Stock"
            value="1,847"
            icon={TrendingUp}
            accent="tech"
            change={{ value: 8, direction: 'up' }}
          />
          <StatCard
            label="Low Stock"
            value="23"
            icon={AlertCircle}
            accent="signature"
            change={{ value: 3, direction: 'down' }}
          />
          <StatCard
            label="Pending Orders"
            value="12"
            icon={Clock}
            accent="tech"
            change={{ value: 2, direction: 'up' }}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1a1a] hairline">
          <div className="px-6 py-4 border-b hairline-subtle">
            <h3 className="text-subheading text-foreground">Recent Activity</h3>
          </div>

          <div className="divide-y divide-[#333333]">
            {[
              {
                action: 'New product added',
                product: 'Signature Parfum - Rose Noir',
                time: '2 hours ago',
              },
              {
                action: 'Stock updated',
                product: 'Tech Hub - Neural Interface',
                time: '4 hours ago',
              },
              {
                action: 'Inventory adjustment',
                product: 'Premium Collection Set',
                time: '1 day ago',
              },
              {
                action: 'Product published',
                product: 'Limited Edition Spring',
                time: '2 days ago',
              },
            ].map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-body text-foreground">{item.action}</p>
                  <p className="text-body-small text-[#a8a8a8] mt-1">{item.product}</p>
                </div>
                <p className="text-body-small text-[#707070] whitespace-nowrap ml-4">{item.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Overview */}
          <div className="bg-[#1a1a1a] hairline p-6">
            <h3 className="text-subheading text-foreground mb-4">Revenue Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-small text-[#a8a8a8]">This Month</span>
                <span className="text-body font-semibold text-[#c89b5c]">$47,292</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-[#a8a8a8]">Last Month</span>
                <span className="text-body font-semibold text-foreground">$42,150</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-small text-[#a8a8a8]">Projected</span>
                <span className="text-body font-semibold text-[#7c9cb4]">$51,500</span>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-[#1a1a1a] hairline p-6">
            <h3 className="text-subheading text-foreground mb-4">Top Categories</h3>
            <div className="space-y-3">
              {[
                { name: 'Parfum', sales: 156, accent: '#c89b5c' },
                { name: 'Tech Hub', sales: 98, accent: '#7c9cb4' },
                { name: 'Skincare', sales: 82, accent: '#6b9e5f' },
              ].map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: cat.accent }}
                    />
                    <span className="text-body-small text-foreground">{cat.name}</span>
                  </div>
                  <span className="text-body-small font-medium text-[#a8a8a8]">{cat.sales}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
