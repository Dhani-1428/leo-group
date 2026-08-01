'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Header } from '@/components/header'
import { ChevronLeft, Sparkles, Cpu } from 'lucide-react'

export default function CreateProductChooserPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) router.push('/login')
    else setIsAuthed(true)
  }, [router])

  if (!isAuthed) return null

  return (
    <LayoutWrapper>
      <Header
        title="Add Product"
        subtitle="Choose perfume or tech — each opens its own dedicated form"
      />

      <div className="p-8">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#a8a8a8] hover:text-[#c89b5c]"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          <Link
            href="/products/create/perfume"
            className="group block border border-[#333] bg-[#1a1a1a] p-8 transition-colors hover:border-[#c89b5c]"
          >
            <Sparkles className="mb-4 h-8 w-8 text-[#c89b5c]" />
            <h2 className="text-xl tracking-wide text-foreground group-hover:text-[#c89b5c]">
              Add Perfume
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#a8a8a8]">
              LEO SIGNATURE form — concentration, fragrance notes, volumes, perfumer, and
              multi sub-categories (Men / Women / Unisex…).
            </p>
          </Link>

          <Link
            href="/products/create/tech"
            className="group block border border-[#333] bg-[#1a1a1a] p-8 transition-colors hover:border-[#c89b5c]"
          >
            <Cpu className="mb-4 h-8 w-8 text-[#c89b5c]" />
            <h2 className="text-xl tracking-wide text-foreground group-hover:text-[#c89b5c]">
              Add Tech
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#a8a8a8]">
              LEO TECH HUB form — chargers, audio, specs, compatibility, and what&apos;s in
              the box.
            </p>
          </Link>
        </div>
      </div>
    </LayoutWrapper>
  )
}
