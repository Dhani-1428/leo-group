'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { ChevronDown, Eye } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  customer: string
  email: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
  items: number
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    total: 1245.50,
    status: 'delivered',
    date: '2024-07-14',
    items: 3,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: 'Marcus Johnson',
    email: 'marcus.j@example.com',
    total: 892.00,
    status: 'shipped',
    date: '2024-07-13',
    items: 2,
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    total: 3456.75,
    status: 'processing',
    date: '2024-07-12',
    items: 5,
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customer: 'James Wilson',
    email: 'james.w@example.com',
    total: 567.25,
    status: 'pending',
    date: '2024-07-11',
    items: 1,
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customer: 'Yuki Tanaka',
    email: 'yuki.tanaka@example.com',
    total: 2134.80,
    status: 'delivered',
    date: '2024-07-10',
    items: 4,
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    customer: 'Olivia Blake',
    email: 'olivia.blake@example.com',
    total: 445.50,
    status: 'cancelled',
    date: '2024-07-09',
    items: 2,
  },
]

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#2a2a1a', text: '#d4a574' },
  processing: { bg: '#1b2429', text: '#7c9cb4' },
  shipped: { bg: '#1a2a18', text: '#6b9e5f' },
  delivered: { bg: '#1a2a18', text: '#6b9e5f' },
  cancelled: { bg: '#2a1a1a', text: '#a85c5c' },
}

export default function OrdersPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/login')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  if (!isAuthed) return null

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
  const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0

  return (
    <LayoutWrapper>
      <Header title="Orders" subtitle="Manage all customer orders and shipments" />

      <div className="p-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1a] hairline p-6">
            <p className="text-body-small text-[#a8a8a8]">Total Orders</p>
            <p className="text-3xl font-bold text-[#c89b5c] mt-2">{mockOrders.length}</p>
            <p className="text-body-small text-[#707070] mt-2">+3 this week</p>
          </div>
          <div className="bg-[#1a1a1a] hairline p-6">
            <p className="text-body-small text-[#a8a8a8]">Total Revenue</p>
            <p className="text-3xl font-bold text-[#7c9cb4] mt-2">${(totalRevenue / 1000).toFixed(1)}K</p>
            <p className="text-body-small text-[#707070] mt-2">All time</p>
          </div>
          <div className="bg-[#1a1a1a] hairline p-6">
            <p className="text-body-small text-[#a8a8a8]">Avg Order Value</p>
            <p className="text-3xl font-bold text-[#6b9e5f] mt-2">${averageOrderValue.toFixed(0)}</p>
            <p className="text-body-small text-[#707070] mt-2">From {filteredOrders.length} orders</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <input
            type="text"
            placeholder="Search by order number, customer, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#1a1a1a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] transition-colors"
          />
          <div className="relative min-w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] hairline text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#a8a8a8]" />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#1a1a1a] hairline overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b hairline-subtle bg-[#0a0a0a]">
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Order #</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Customer</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Items</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Total</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {filteredOrders.map((order) => {
                  const colors = statusColors[order.status]
                  return (
                    <tr key={order.id} className="hover:bg-[#111111] transition-colors">
                      <td className="px-6 py-4 text-body-small text-[#c89b5c] font-medium">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-body-small text-foreground">{order.customer}</td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8]">{order.email}</td>
                      <td className="px-6 py-4 text-body-small text-foreground">{order.items}</td>
                      <td className="px-6 py-4 text-body-small font-medium text-[#7c9cb4]">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-block px-3 py-1 text-body-small font-medium rounded-none"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8]">{order.date}</td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-[#2a2a2a] rounded-none transition-colors">
                          <Eye className="w-4 h-4 text-[#a8a8a8] hover:text-[#c89b5c]" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-body-small text-[#707070]">No orders found matching your criteria</p>
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
