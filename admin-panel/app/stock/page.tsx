'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { AlertTriangle, Plus, Minus, RefreshCw } from 'lucide-react'
import {
  listCatalogProducts,
  updateCatalogStock,
  API_BASE,
} from '@/lib/catalog-api'
import type { CatalogProduct } from '@/lib/catalog-types'

const LOW_THRESHOLD = 10

export default function StockPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [adjusting, setAdjusting] = useState<string | null>(null)
  const [adjustAmount, setAdjustAmount] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setProducts(await listCatalogProducts())
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message}. Is the website running at ${API_BASE}?`
          : 'Failed to load stock',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) router.push('/login')
    else setIsAuthed(true)
  }, [router])

  useEffect(() => {
    if (isAuthed) load()
  }, [isAuthed, load])

  if (!isAuthed) return null

  const lowStockItems = products.filter((p) => p.stock > 0 && p.stock < LOW_THRESHOLD)
  const outOfStockItems = products.filter((p) => p.stock === 0)

  async function applyStock(id: string, next: number) {
    try {
      const product = await updateCatalogStock(id, Math.max(0, next))
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)))
      setToast('Stock updated — live on website')
      setAdjusting(null)
      setAdjustAmount(0)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Stock update failed')
    }
  }

  return (
    <LayoutWrapper>
      <Header
        title="Stock"
        subtitle="Inventory synced with the live website catalog"
        actions={
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hairline text-foreground rounded-none hover:bg-[#2a2a2a] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      <div className="p-8 space-y-6">
        {toast && (
          <div className="px-4 py-3 bg-[#6b9e5f]/15 text-[#6b9e5f] text-body-small">
            {toast}
            <button className="ml-4 underline" onClick={() => setToast('')}>
              dismiss
            </button>
          </div>
        )}
        {error && (
          <div className="px-4 py-3 bg-[#a85c5c]/15 text-[#a85c5c] text-body-small">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] hairline p-5">
            <div className="text-body-small text-[#a8a8a8]">Products</div>
            <div className="text-2xl text-foreground mt-1">{products.length}</div>
          </div>
          <div className="bg-[#1a1a1a] hairline p-5">
            <div className="text-body-small text-[#d4a574] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Low stock (&lt;{LOW_THRESHOLD})
            </div>
            <div className="text-2xl text-[#d4a574] mt-1">{lowStockItems.length}</div>
          </div>
          <div className="bg-[#1a1a1a] hairline p-5">
            <div className="text-body-small text-[#a85c5c]">Out of stock</div>
            <div className="text-2xl text-[#a85c5c] mt-1">{outOfStockItems.length}</div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] hairline overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b hairline-subtle">
                <th className="px-6 py-4 text-left text-body-small font-semibold">Product</th>
                <th className="px-6 py-4 text-left text-body-small font-semibold">SKU</th>
                <th className="px-6 py-4 text-left text-body-small font-semibold">Current</th>
                <th className="px-6 py-4 text-left text-body-small font-semibold">Updated</th>
                <th className="px-6 py-4 text-left text-body-small font-semibold">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#707070]">
                    Loading…
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-[#2a2a2a]">
                    <td className="px-6 py-4 text-foreground">{item.name}</td>
                    <td className="px-6 py-4 font-mono text-body-small text-[#a8a8a8]">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        style={{
                          color:
                            item.stock === 0
                              ? '#a85c5c'
                              : item.stock < LOW_THRESHOLD
                                ? '#d4a574'
                                : '#6b9e5f',
                        }}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-small text-[#707070]">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {adjusting === item.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="p-1 hover:bg-[#333]"
                            onClick={() => setAdjustAmount((a) => a - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            className="w-16 px-2 py-1 bg-[#0a0a0a] hairline text-center"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(Number(e.target.value))}
                          />
                          <button
                            type="button"
                            className="p-1 hover:bg-[#333]"
                            onClick={() => setAdjustAmount((a) => a + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 bg-[#c89b5c] text-[#0a0a0a] text-body-small"
                            onClick={() => applyStock(item.id, item.stock + adjustAmount)}
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            className="text-body-small text-[#a8a8a8]"
                            onClick={() => {
                              setAdjusting(null)
                              setAdjustAmount(0)
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1 hairline text-body-small hover:bg-[#333]"
                          onClick={() => {
                            setAdjusting(item.id)
                            setAdjustAmount(0)
                          }}
                        >
                          Adjust
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutWrapper>
  )
}
