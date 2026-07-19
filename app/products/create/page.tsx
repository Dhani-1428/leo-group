'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { FormField } from '@/components/form-field'
import { ImageUploader, type ProductImage } from '@/components/image-uploader'
import { ChevronLeft, Save } from 'lucide-react'

export default function ProductCreatePage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    sku: '',
    description: '',
    category: 'Parfum',
    price: '',
    stock: '',
    type: 'Eau de Toilette',
    availability: 'Available in store' as const,
    genderCategories: ['Unisex'] as string[],
    status: 'active' as const,
    collections: [] as string[],
    images: [] as ProductImage[],
  })

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/login')
    } else {
      setIsAuthed(true)
    }
  }, [router])

  if (!isAuthed) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    // Simulate save
    await new Promise((r) => setTimeout(r, 500))
    router.push('/products')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (gender: string) => {
    setFormData((prev) => {
      const updated = prev.genderCategories.includes(gender)
        ? prev.genderCategories.filter((g) => g !== gender)
        : [...prev.genderCategories, gender]
      return { ...prev, genderCategories: updated.length > 0 ? updated : ['Unisex'] }
    })
  }

  return (
    <LayoutWrapper>
      <Header
        title="Create Product"
        subtitle="Add a new product to LEO WORLD catalog"
      />

      <div className="p-8">
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-[#1a1a1a] hairline p-8 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-subheading text-foreground mb-4">Basic Information</h3>
              <div className="space-y-4">
                <FormField label="Brand Name" required>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., LEO WORLD, Chanel, Dior"
                    className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]"
                    required
                  />
                </FormField>

                <FormField label="Product Name" required>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]"
                    required
                  />
                </FormField>

                <FormField label="SKU" required hint="Unique product identifier">
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="e.g., SIG-RN-001"
                    className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] font-mono text-sm"
                    required
                  />
                </FormField>

                <FormField label="Description" required>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your product"
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] resize-none"
                    required
                  />
                </FormField>
              </div>
            </div>

            <div className="border-t hairline-subtle pt-6">
              {/* Category Selection */}
              <h3 className="text-subheading text-foreground mb-4">Classification</h3>
              
              <FormField label="Category" required>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]"
                >
                  <option value="Parfum">Perfume</option>
                  <option value="Tech Hub">Tech Hub</option>
                </select>
              </FormField>

              {/* Perfume-Specific Fields */}
              {formData.category === 'Parfum' && (
                <div className="border-t hairline-subtle mt-6 pt-6 space-y-4">
                  <h4 className="text-body font-semibold text-[#c89b5c]">Perfume Details</h4>
                  
                  <FormField label="Fragrance Type" required>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]"
                    >
                      <option value="Eau de Toilette">Eau de Toilette</option>
                      <option value="Eau de Parfum">Eau de Parfum</option>
                      <option value="Extrait de Parfum">Extrait de Parfum</option>
                      <option value="Pure Parfum">Pure Parfum</option>
                    </select>
                  </FormField>

                  <FormField label="Gender Categories" required hint="Select all that apply">
                    <div className="space-y-3">
                      {['Men', 'Women', 'Unisex'].map((gender) => (
                        <label key={gender} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.genderCategories.includes(gender)}
                            onChange={() => handleGenderChange(gender)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="text-body-small text-foreground">{gender}</span>
                        </label>
                      ))}
                    </div>
                  </FormField>
                </div>
              )}

              {/* Tech Hub-Specific Fields */}
              {formData.category === 'Tech Hub' && (
                <div className="border-t hairline-subtle mt-6 pt-6 space-y-4">
                  <h4 className="text-body font-semibold text-[#7c9cb4]">Tech Product Details</h4>
                  
                  <FormField label="Product Type" required>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]"
                    >
                      <option value="Device">Device</option>
                      <option value="Accessory">Accessory</option>
                      <option value="Software">Software</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormField>

                  <FormField label="Compatible Models">
                    <input
                      type="text"
                      name="compatible"
                      placeholder="e.g., Model X, Model Y, Model Z"
                      className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]"
                    />
                  </FormField>
                </div>
              )}

              {/* Common Fields */}
              <div className="border-t hairline-subtle mt-6 pt-6 space-y-4">
                <FormField label="Availability" required>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]"
                  >
                    <option value="Available in store">Available in store</option>
                    <option value="Available online only">Available online only</option>
                  </select>
                </FormField>
              </div>
            </div>

            <div className="border-t hairline-subtle pt-6">
              {/* Pricing & Stock */}
              <h3 className="text-subheading text-foreground mb-4">Pricing & Inventory</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Price" required>
                  <div className="flex items-center">
                    <span className="px-4 py-3 bg-[#0a0a0a] hairline text-[#a8a8a8] text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-3 bg-[#0a0a0a] hairline-subtle text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] text-right"
                      required
                    />
                  </div>
                </FormField>

                <FormField label="Initial Stock" required>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]"
                    required
                  />
                </FormField>
              </div>
            </div>

            <div className="border-t hairline-subtle pt-6">
              {/* Product Images */}
              <h3 className="text-subheading text-foreground mb-4">Product Images</h3>
              <ImageUploader
                onImagesChange={(images) =>
                  setFormData((prev) => ({ ...prev, images }))
                }
                maxImages={5}
                maxSizePerImage={10}
              />
            </div>

            <div className="border-t hairline-subtle pt-6">
              {/* Status */}
              <h3 className="text-subheading text-foreground mb-4">Publishing</h3>
              <FormField label="Status">
                <div className="flex gap-4">
                  {(['active', 'inactive'] as const).map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={formData.status === status}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-body-small text-foreground capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </FormField>
            </div>

            {/* Actions */}
            <div className="border-t hairline-subtle pt-6 flex items-center justify-between">
              <Link href="/products">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-3 text-foreground hover:bg-[#2a2a2a] rounded-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Cancel
                </button>
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-[#c89b5c] text-[#0a0a0a] font-medium rounded-none hover:bg-[#e8c989] transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Create Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </LayoutWrapper>
  )
}
