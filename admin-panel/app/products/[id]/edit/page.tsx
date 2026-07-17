'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { ChevronLeft, Save, ExternalLink } from 'lucide-react'
import {
  ProductFormFields,
  blankForm,
  formToPayload,
  productToForm,
  type ProductFormState,
} from '@/components/product-form-fields'
import {
  getCatalogProduct,
  updateCatalogProduct,
  websiteProductUrl,
} from '@/lib/catalog-api'

export default function ProductEditPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = decodeURIComponent(params.id)

  const [isAuthed, setIsAuthed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState<ProductFormState>(blankForm())

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) router.push('/login')
    else setIsAuthed(true)
  }, [router])

  useEffect(() => {
    if (!isAuthed) return
    ;(async () => {
      try {
        const product = await getCatalogProduct(id)
        setForm(productToForm(product))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    })()
  }, [isAuthed, id])

  if (!isAuthed) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setToast('')
    try {
      const payload = formToPayload(form)
      await updateCatalogProduct(id, payload)
      setToast('Saved — live on website')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <LayoutWrapper>
      <Header
        title="Edit Product"
        subtitle={id}
        actions={
          <a
            href={websiteProductUrl(id)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hairline text-foreground rounded-none hover:bg-[#2a2a2a] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on website
          </a>
        }
      />

      <div className="p-8">
        {loading ? (
          <p className="text-[#707070]">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="bg-[#1a1a1a] hairline p-8 space-y-6">
              {toast && (
                <div className="px-4 py-3 bg-[#6b9e5f]/15 text-[#6b9e5f] text-body-small">
                  {toast}
                </div>
              )}
              {error && (
                <div className="px-4 py-3 bg-[#a85c5c]/15 text-[#a85c5c] text-body-small">
                  {error}
                </div>
              )}

              <ProductFormFields form={form} setForm={setForm} idEditable={false} />

              <div className="border-t hairline-subtle pt-6 flex items-center justify-between">
                <Link href="/products">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-3 text-foreground hover:bg-[#2a2a2a] rounded-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                </Link>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#c89b5c] text-[#0a0a0a] font-medium rounded-none hover:bg-[#e8c989] transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </LayoutWrapper>
  )
}
