'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'

interface ChartData {
  month: string
  revenue: number
  profit: number
  orders: number
}

const chartData: ChartData[] = [
  { month: 'Jan', revenue: 42000, profit: 12600, orders: 128 },
  { month: 'Feb', revenue: 38500, profit: 11550, orders: 115 },
  { month: 'Mar', revenue: 51200, profit: 15360, orders: 156 },
  { month: 'Apr', revenue: 59800, profit: 17940, orders: 189 },
  { month: 'May', revenue: 68500, profit: 20550, orders: 212 },
  { month: 'Jun', revenue: 75200, profit: 22560, orders: 245 },
]

export default function AnalyticsPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [timeRange, setTimeRange] = useState('6m')

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/login')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  if (!isAuthed) return null

  const latestData = chartData[chartData.length - 1]
  const previousData = chartData[chartData.length - 2]
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
  const totalProfit = chartData.reduce((sum, item) => sum + item.profit, 0)
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0)
  const profitMargin = (totalProfit / totalRevenue * 100).toFixed(1)

  const revenueChange = ((latestData.revenue - previousData.revenue) / previousData.revenue * 100).toFixed(1)
  const orderChange = ((latestData.orders - previousData.orders) / previousData.orders * 100).toFixed(1)

  return (
    <LayoutWrapper>
      <Header title="Financial Analytics" subtitle="Revenue, profit, and performance metrics" />

      <div className="p-8 space-y-8">
        {/* Time Range Filter */}
        <div className="flex gap-2">
          {['1m', '3m', '6m', '1y', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-none transition-colors text-body-small font-medium ${
                timeRange === range
                  ? 'bg-[#c89b5c] text-[#0a0a0a]'
                  : 'bg-[#1a1a1a] hairline text-[#a8a8a8] hover:text-foreground'
              }`}
            >
              {range === '1m' ? '1 Month' : range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : range === '1y' ? '1 Year' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-[#1a1a1a] hairline p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-body-small text-[#a8a8a8]">Total Revenue</p>
                <p className="text-3xl font-bold text-[#c89b5c] mt-2">${(totalRevenue / 1000).toFixed(1)}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-[#c89b5c] opacity-50" />
            </div>
            <div className="mt-4 pt-4 border-t hairline-subtle">
              <p className="text-body-small text-[#6b9e5f] flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {revenueChange}% vs last month
              </p>
            </div>
          </div>

          {/* Total Profit */}
          <div className="bg-[#1a1a1a] hairline p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-body-small text-[#a8a8a8]">Total Profit</p>
                <p className="text-3xl font-bold text-[#7c9cb4] mt-2">${(totalProfit / 1000).toFixed(1)}K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#7c9cb4] opacity-50" />
            </div>
            <div className="mt-4 pt-4 border-t hairline-subtle">
              <p className="text-body-small text-[#a8a8a8]">Margin: {profitMargin}%</p>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-[#1a1a1a] hairline p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-body-small text-[#a8a8a8]">Avg Order Value</p>
                <p className="text-3xl font-bold text-[#6b9e5f] mt-2">${(totalRevenue / totalOrders).toFixed(0)}</p>
              </div>
              <PieChart className="w-8 h-8 text-[#6b9e5f] opacity-50" />
            </div>
            <div className="mt-4 pt-4 border-t hairline-subtle">
              <p className="text-body-small text-[#a8a8a8]">{totalOrders.toLocaleString()} total orders</p>
            </div>
          </div>

          {/* Current Month Performance */}
          <div className="bg-[#1a1a1a] hairline p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-body-small text-[#a8a8a8]">This Month Orders</p>
                <p className="text-3xl font-bold text-[#d4a574] mt-2">{latestData.orders}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#d4a574] opacity-50" />
            </div>
            <div className="mt-4 pt-4 border-t hairline-subtle">
              <p className={`text-body-small ${parseInt(orderChange) >= 0 ? 'text-[#6b9e5f]' : 'text-[#a85c5c]'} flex items-center gap-1`}>
                {parseInt(orderChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(parseFloat(orderChange))}% vs last month
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-[#1a1a1a] hairline p-6">
          <h3 className="text-subheading text-foreground mb-6">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {chartData.map((data, i) => {
              const maxRevenue = Math.max(...chartData.map((d) => d.revenue))
              const heightPercent = (data.revenue / maxRevenue) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center mb-2">
                    <div
                      className="w-full bg-[#c89b5c] hover:bg-[#e8c989] transition-colors"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-code text-[#a8a8a8] text-center">{data.month}</span>
                  <span className="text-body-small text-[#707070] mt-1">${(data.revenue / 1000).toFixed(0)}K</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Breakdown */}
          <div className="bg-[#1a1a1a] hairline overflow-hidden">
            <div className="px-6 py-4 border-b hairline-subtle bg-[#0a0a0a]">
              <h3 className="text-subheading text-foreground">Monthly Revenue</h3>
            </div>
            <div className="divide-y divide-[#333333]">
              {chartData.map((data, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-[#111111] transition-colors">
                  <span className="text-body-small text-foreground font-medium">{data.month}</span>
                  <span className="text-body-small text-[#c89b5c] font-semibold">${data.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profit Breakdown */}
          <div className="bg-[#1a1a1a] hairline overflow-hidden">
            <div className="px-6 py-4 border-b hairline-subtle bg-[#0a0a0a]">
              <h3 className="text-subheading text-foreground">Monthly Profit</h3>
            </div>
            <div className="divide-y divide-[#333333]">
              {chartData.map((data, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-[#111111] transition-colors">
                  <span className="text-body-small text-foreground font-medium">{data.month}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-body-small text-[#7c9cb4] font-semibold">${data.profit.toLocaleString()}</span>
                    <span className="text-code text-[#a8a8a8]">{((data.profit / data.revenue) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1a] hairline p-6">
            <p className="text-body-small text-[#a8a8a8]">Average Monthly Revenue</p>
            <p className="text-2xl font-bold text-[#c89b5c] mt-2">${(totalRevenue / chartData.length / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-[#1a1a1a] hairline p-6">
            <p className="text-body-small text-[#a8a8a8]">Average Monthly Profit</p>
            <p className="text-2xl font-bold text-[#7c9cb4] mt-2">${(totalProfit / chartData.length / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-[#1a1a1a] hairline p-6">
            <p className="text-body-small text-[#a8a8a8]">Overall Profit Margin</p>
            <p className="text-2xl font-bold text-[#6b9e5f] mt-2">{profitMargin}%</p>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
