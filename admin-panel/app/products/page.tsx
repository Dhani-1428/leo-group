'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { Search, Plus, Edit2, Trash2, Eye, RefreshCw } from 'lucide-react'
import {
  deleteCatalogProduct,
  listCatalogProducts,
  websiteProductUrl,
  resolveImageUrl,
  API_BASE,
} from '@/lib/catalog-api'
import type { CatalogProduct } from '@/lib/catalog-types'

export default function ProductsPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await listCatalogProducts()
      setProducts(list)
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message}. Is the website running at ${API_BASE}?`
          : 'Failed to load products',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/login')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  useEffect(() => {
    if (isAuthed) load()
  }, [isAuthed, load])

  if (!isAuthed) return null

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete “${name}”? This removes it from the live website.`)) return
    try {
      await deleteCatalogProduct(id)
      setToast('Deleted — removed from website')
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <LayoutWrapper>
      <Header
        title="Products"
        subtitle="Manage catalog — changes go live on the website"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hairline text-foreground rounded-none hover:bg-[#2a2a2a] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/products/create/perfume"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#c89b5c] text-[#0a0a0a] font-medium rounded-none hover:bg-[#e8c989] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Perfume
            </Link>
            <Link
              href="/products/create/tech"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hairline text-foreground rounded-none hover:bg-[#2a2a2a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Tech
            </Link>
          </div>
        }
      />

      <div className="p-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/products/create/perfume"
            className="flex items-center gap-4 border border-[#c89b5c]/40 bg-[#c89b5c]/10 px-5 py-5 transition-colors hover:bg-[#c89b5c]/20"
          >
            <Plus className="h-6 w-6 shrink-0 text-[#c89b5c]" />
            <div>
              <div className="font-medium text-[#c89b5c]">Add Perfume</div>
              <div className="mt-1 text-sm text-[#a8a8a8]">
                Concentration, notes, volumes, Men / Women / Unisex
              </div>
            </div>
          </Link>
          <Link
            href="/products/create/tech"
            className="flex items-center gap-4 border border-[#333] bg-[#1a1a1a] px-5 py-5 transition-colors hover:border-[#c89b5c]/50"
          >
            <Plus className="h-6 w-6 shrink-0 text-[#a8a8a8]" />
            <div>
              <div className="font-medium text-foreground">Add Tech</div>
              <div className="mt-1 text-sm text-[#a8a8a8]">
                Specs, compatibility, and what&apos;s in the box
              </div>
            </div>
          </Link>
        </div>

        {toast && (
          <div className="mb-4 px-4 py-3 bg-[#6b9e5f]/15 text-[#6b9e5f] text-body-small">
            {toast}
            <button className="ml-4 underline" onClick={() => setToast('')}>
              dismiss
            </button>
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 bg-[#a85c5c]/15 text-[#a85c5c] text-body-small">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a8a8a8]" />
            <input
              type="text"
              placeholder="Search by name, SKU, or id..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] transition-colors"
            />
          </div>
        </div>

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
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#707070]">
                      Loading catalog…
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[#2a2a2a] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveImageUrl(product.images[0])}
                              alt=""
                              className="w-10 h-12 object-cover bg-[#0a0a0a]"
                            />
                          )}
                          <div>
                            <div className="text-body text-foreground">{product.name}</div>
                            <div className="text-body-small text-[#707070]">{product.line}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8] font-mono">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8]">
                        {product.category}
                        {product.subCategory ? ` / ${product.subCategory}` : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-body-small font-medium"
                          style={{
                            color:
                              product.stock > 10
                                ? '#6b9e5f'
                                : product.stock > 0
                                  ? '#d4a574'
                                  : '#a85c5c',
                          }}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-body font-semibold text-[#c89b5c]">
                        €{Number(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-body-small font-medium rounded-none ${
                            product.status === 'published'
                              ? 'bg-[#6b9e5f]/10 text-[#6b9e5f]'
                              : 'bg-[#707070]/10 text-[#707070]'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={websiteProductUrl(product.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 hover:bg-[#333333] rounded-none transition-colors"
                            title="View on website"
                          >
                            <Eye className="w-4 h-4 text-[#a8a8a8]" />
                          </a>
                          <Link href={`/products/${product.id}/edit`}>
                            <button className="p-2 hover:bg-[#333333] rounded-none transition-colors">
                              <Edit2 className="w-4 h-4 text-[#a8a8a8]" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 hover:bg-[#333333] rounded-none transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-[#a85c5c]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#707070]">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-body-small text-[#a8a8a8]">
            Showing {filteredProducts.length} of {products.length} products · API {API_BASE}
          </p>
        </div>
      </div>
    </LayoutWrapper>
  )
}
