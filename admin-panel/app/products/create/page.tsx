'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { ChevronLeft, Save } from 'lucide-react'
import {
  ProductFormFields,
  blankForm,
  formToPayload,
  type ProductFormState,
} from '@/components/product-form-fields'
import { createCatalogProduct } from '@/lib/catalog-api'
import { slugify } from '@/lib/catalog-types'

export default function ProductCreatePage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<ProductFormState>(blankForm())

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) router.push('/login')
    else setIsAuthed(true)
  }, [router])

  if (!isAuthed) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      const withIds = {
        ...form,
        id: form.id.trim() || slugify(form.name),
        sku: form.sku.trim() || slugify(form.name).toUpperCase(),
      }
      const payload = formToPayload(withIds)
      if (!payload.id) throw new Error('Product id is required')
      await createCatalogProduct(payload)
      router.push('/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      setIsSaving(false)
    }
  }

  return (
    <LayoutWrapper>
      <Header
        title="Create Product"
        subtitle="Add a product — it will appear on the live website when published"
      />

      <div className="p-8">
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-[#1a1a1a] hairline p-8 space-y-6">
            {error && (
              <div className="px-4 py-3 bg-[#a85c5c]/15 text-[#a85c5c] text-body-small">
                {error}
              </div>
            )}

            <ProductFormFields form={form} setForm={setForm} idEditable />

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
                {isSaving ? 'Saving…' : 'Create Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </LayoutWrapper>
  )
}
