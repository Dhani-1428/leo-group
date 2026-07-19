'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { AlertTriangle, Plus, Minus, RefreshCw } from 'lucide-react'

interface StockItem {
  id: string
  name: string
  sku: string
  current: number
  minimum: number
  maximum: number
  lastUpdated: string
  location: string
}

const MOCK_STOCK: StockItem[] = [
  {
    id: '1',
    name: 'Signature Parfum - Rose Noir',
    sku: 'SIG-RN-001',
    current: 145,
    minimum: 50,
    maximum: 300,
    lastUpdated: '2024-01-15',
    location: 'A-01',
  },
  {
    id: '2',
    name: 'Signature Parfum - Oud Essence',
    sku: 'SIG-OE-002',
    current: 12,
    minimum: 50,
    maximum: 300,
    lastUpdated: '2024-01-14',
    location: 'A-02',
  },
  {
    id: '3',
    name: 'Tech Hub - Neural Interface',
    sku: 'TECH-NI-001',
    current: 34,
    minimum: 20,
    maximum: 100,
    lastUpdated: '2024-01-15',
    location: 'B-01',
  },
  {
    id: '4',
    name: 'Skincare Serum - Hydration Plus',
    sku: 'SKIN-HP-001',
    current: 0,
    minimum: 25,
    maximum: 150,
    lastUpdated: '2024-01-13',
    location: 'C-01',
  },
  {
    id: '5',
    name: 'Limited Edition Spring Collection',
    sku: 'LIM-SP-001',
    current: 8,
    minimum: 10,
    maximum: 50,
    lastUpdated: '2024-01-15',
    location: 'D-01',
  },
]

export default function StockPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [stock, setStock] = useState<StockItem[]>(MOCK_STOCK)
  const [adjusting, setAdjusting] = useState<string | null>(null)
  const [adjustAmount, setAdjustAmount] = useState(0)

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/login')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  if (!isAuthed) return null

  const lowStockItems = stock.filter((item) => item.current < item.minimum)
  const outOfStockItems = stock.filter((item) => item.current === 0)

  const handleAdjustStock = (id: string, amount: number) => {
    setStock((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              current: Math.max(0, Math.min(item.maximum, item.current + amount)),
            }
          : item
      )
    )
    setAdjusting(null)
    setAdjustAmount(0)
  }

  return (
    <LayoutWrapper>
      <Header
        title="Stock Management"
        subtitle="Monitor and adjust inventory levels"
      />

      <div className="p-8 space-y-8">
        {/* Alerts */}
        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outOfStockItems.length > 0 && (
              <div className="bg-[#a85c5c]/10 hairline border-[#a85c5c] p-4 rounded-none">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#a85c5c] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-body font-semibold text-[#a85c5c]">Out of Stock</h4>
                    <p className="text-body-small text-[#a8a8a8] mt-1">
                      {outOfStockItems.length} product{outOfStockItems.length !== 1 ? 's' : ''} require immediate
                      restocking
                    </p>
                  </div>
                </div>
              </div>
            )}

            {lowStockItems.length > 0 && (
              <div className="bg-[#d4a574]/10 hairline border-[#d4a574] p-4 rounded-none">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#d4a574] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-body font-semibold text-[#d4a574]">Low Stock</h4>
                    <p className="text-body-small text-[#a8a8a8] mt-1">
                      {lowStockItems.length} product{lowStockItems.length !== 1 ? 's' : ''} below minimum threshold
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stock Table */}
        <div className="bg-[#1a1a1a] hairline overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b hairline-subtle">
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    Location
                  </th>
                  <th className="px-6 py-4 text-center text-body-small font-semibold text-foreground">
                    Current
                  </th>
                  <th className="px-6 py-4 text-center text-body-small font-semibold text-foreground">
                    Min/Max
                  </th>
                  <th className="px-6 py-4 text-center text-body-small font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-body-small font-semibold text-foreground">
                    Adjust
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {stock.map((item) => {
                  const isLow = item.current < item.minimum
                  const isOutOfStock = item.current === 0
                  const statusColor = isOutOfStock ? '#a85c5c' : isLow ? '#d4a574' : '#6b9e5f'

                  return (
                    <tr key={item.id} className="hover:bg-[#2a2a2a] transition-colors">
                      <td className="px-6 py-4 text-body text-foreground">{item.name}</td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8] font-mono">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8]">{item.location}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-foreground">{item.current}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-body-small text-[#a8a8a8]">
                        {item.minimum} / {item.maximum}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="inline-block px-3 py-1 text-body-small font-medium rounded-none"
                          style={{
                            backgroundColor: `${statusColor}15`,
                            color: statusColor,
                          }}
                        >
                          {isOutOfStock ? 'Out' : isLow ? 'Low' : 'OK'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {adjusting === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleAdjustStock(item.id, -adjustAmount)}
                                className="p-1 bg-[#333333] hover:bg-[#444444] rounded-none"
                              >
                                <Minus className="w-4 h-4 text-[#a8a8a8]" />
                              </button>
                              <input
                                type="number"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                                className="w-12 px-2 py-1 bg-[#0a0a0a] hairline text-foreground text-center rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-[#c89b5c]"
                              />
                              <button
                                onClick={() => handleAdjustStock(item.id, adjustAmount)}
                                className="p-1 bg-[#333333] hover:bg-[#444444] rounded-none"
                              >
                                <Plus className="w-4 h-4 text-[#a8a8a8]" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAdjusting(item.id)}
                              className="p-2 bg-[#333333] hover:bg-[#444444] rounded-none transition-colors"
                            >
                              <RefreshCw className="w-4 h-4 text-[#a8a8a8]" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-body-small text-[#707070]">
          <p>Last synced: Today at 2:45 PM</p>
        </div>
      </div>
    </LayoutWrapper>
  )
}
