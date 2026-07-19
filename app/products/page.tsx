'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  sku: string
  category: string
  stock: number
  price: number
  status: 'active' | 'inactive'
  image?: string
  availability: 'Available in store' | 'Available online only'
  genderCategories: string[]
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Rose Noir',
    brand: 'LEO WORLD',
    sku: 'SIG-RN-001',
    category: 'Parfum',
    stock: 145,
    price: 285,
    status: 'active',
    image: '/product-rose-noir.png',
    availability: 'Available in store',
    genderCategories: ['Women'],
  },
  {
    id: '2',
    name: 'Oud Essence',
    brand: 'LEO WORLD',
    sku: 'SIG-OE-002',
    category: 'Parfum',
    stock: 89,
    price: 325,
    status: 'active',
    image: '/product-oud-essence.png',
    availability: 'Available online only',
    genderCategories: ['Men', 'Women', 'Unisex'],
  },
  {
    id: '3',
    name: 'Neural Interface',
    brand: 'Tech Hub Labs',
    sku: 'TECH-NI-001',
    category: 'Tech Hub',
    stock: 34,
    price: 1250,
    status: 'active',
    image: '/product-neural-interface.png',
    availability: 'Available in store',
    genderCategories: ['Unisex'],
  },
]

export default function ProductsPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/login')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  if (!isAuthed) return null

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <LayoutWrapper>
      <Header
        title="Products"
        subtitle="Manage your product catalog"
        actions={
          <Link
            href="/products/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#c89b5c] text-[#0a0a0a] font-medium rounded-none hover:bg-[#e8c989] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Product
          </Link>
        }
      />

      <div className="p-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a8a8a8]" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] transition-colors"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#1a1a1a] hairline overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b hairline-subtle">
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    Product Name
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
                    Availability
                  </th>
                  <th className="px-6 py-4 text-left text-body-small font-semibold text-foreground">
                    Gender
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
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[#2a2a2a] transition-colors">
                      <td className="px-6 py-4">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover hairline"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#2a2a2a] hairline flex items-center justify-center text-[#707070]">
                            —
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-body font-semibold text-[#c89b5c]">
                        {product.brand}
                      </td>
                      <td className="px-6 py-4 text-body text-foreground">{product.name}</td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8] font-mono">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-body-small text-[#a8a8a8]">
                        {product.category}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-body-small font-medium"
                          style={{
                            color:
                              product.stock > 50
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
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-body-small font-medium rounded-none ${
                            product.availability === 'Available in store'
                              ? 'bg-[#c89b5c]/10 text-[#c89b5c]'
                              : 'bg-[#7c9cb4]/10 text-[#7c9cb4]'
                          }`}
                        >
                          {product.availability === 'Available in store'
                            ? 'In Store'
                            : 'Online Only'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {product.genderCategories.map((gender) => (
                            <span
                              key={gender}
                              className={`inline-block px-2.5 py-1 text-body-small font-medium rounded-none ${
                                gender === 'Men'
                                  ? 'bg-[#7c9cb4]/10 text-[#7c9cb4]'
                                  : gender === 'Women'
                                    ? 'bg-[#d4a574]/10 text-[#d4a574]'
                                    : 'bg-[#6b9e5f]/10 text-[#6b9e5f]'
                              }`}
                            >
                              {gender}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-body-small font-medium rounded-none ${
                            product.status === 'active'
                              ? 'bg-[#6b9e5f]/10 text-[#6b9e5f]'
                              : 'bg-[#707070]/10 text-[#707070]'
                          }`}
                        >
                          {product.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-[#333333] rounded-none transition-colors">
                            <Eye className="w-4 h-4 text-[#a8a8a8]" />
                          </button>
                          <Link href={`/products/${product.id}/edit`}>
                            <button className="p-2 hover:bg-[#333333] rounded-none transition-colors">
                              <Edit2 className="w-4 h-4 text-[#a8a8a8]" />
                            </button>
                          </Link>
                          <button className="p-2 hover:bg-[#333333] rounded-none transition-colors">
                            <Trash2 className="w-4 h-4 text-[#a85c5c]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-[#707070]">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-body-small text-[#a8a8a8]">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-[#1a1a1a] hairline text-foreground rounded-none hover:bg-[#2a2a2a] transition-colors text-body-small font-medium">
              Previous
            </button>
            <button className="px-3 py-2 bg-[#c89b5c] text-[#0a0a0a] rounded-none hover:bg-[#e8c989] transition-colors text-body-small font-medium">
              1
            </button>
            <button className="px-3 py-2 bg-[#1a1a1a] hairline text-foreground rounded-none hover:bg-[#2a2a2a] transition-colors text-body-small font-medium">
              Next
            </button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
