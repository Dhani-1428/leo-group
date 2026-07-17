'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { StatCard } from '@/components/stat-card'
import { ShoppingBag, TrendingUp, AlertCircle, Package } from 'lucide-react'
import { listCatalogProducts, API_BASE } from '@/lib/catalog-api'
import type { CatalogProduct } from '@/lib/catalog-types'

const LOW = 10

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setProducts(await listCatalogProducts())
      setError('')
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message}. Start the website at ${API_BASE} so the admin can sync.`
          : 'Failed to load',
      )
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

  const published = products.filter((p) => p.status === 'published').length
  const inStock = products.filter((p) => p.stock > 0).length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < LOW).length
  const out = products.filter((p) => p.stock === 0).length
  const recent = [...products]
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 6)

  return (
    <LayoutWrapper>
      <Header
        title="Dashboard"
        subtitle="Live catalog connected to the LEO GROUP website"
      />

      <div className="p-8 space-y-8">
        {error && (
          <div className="px-4 py-3 bg-[#a85c5c]/15 text-[#a85c5c] text-body-small">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Products"
            value={String(products.length)}
            icon={ShoppingBag}
            accent="signature"
          />
          <StatCard
            label="Published"
            value={String(published)}
            icon={Package}
            accent="tech"
          />
          <StatCard
            label="In Stock"
            value={String(inStock)}
            icon={TrendingUp}
            accent="tech"
          />
          <StatCard
            label="Low / Out"
            value={`${lowStock} / ${out}`}
            icon={AlertCircle}
            accent="signature"
          />
        </div>

        <div className="bg-[#1a1a1a] hairline">
          <div className="px-6 py-4 border-b hairline-subtle flex items-center justify-between">
            <h3 className="text-subheading text-foreground">Recently updated</h3>
            <Link href="/products" className="text-body-small text-[#c89b5c] hover:underline">
              Manage products →
            </Link>
          </div>
          <div className="divide-y divide-[#333333]">
            {recent.length === 0 ? (
              <div className="px-6 py-8 text-[#707070]">No products yet</div>
            ) : (
              recent.map((p) => (
                <div
                  key={p.id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-foreground">{p.name}</div>
                    <div className="text-body-small text-[#707070]">
                      {p.category} · stock {p.stock} · {p.status}
                    </div>
                  </div>
                  <Link
                    href={`/products/${p.id}/edit`}
                    className="text-body-small text-[#c89b5c] hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
