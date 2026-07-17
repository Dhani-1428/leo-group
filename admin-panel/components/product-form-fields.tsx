'use client'

import { FormField } from '@/components/form-field'
import {
  PARFUM_SUBS,
  TECH_SUBS,
  type CatalogProduct,
  type Category,
  type PublishStatus,
} from '@/lib/catalog-types'

export type ProductFormState = {
  id: string
  name: string
  sku: string
  category: Category
  subCategory: string
  line: string
  price: string
  stock: string
  tag: string
  short: string
  description: string
  status: PublishStatus
  images: string
  // perfume
  concentration: string
  volumes: string
  perfumer: string
  ingredients: string
  notesTop: string
  notesHeart: string
  notesBase: string
  // tech
  specs: string
  compatibility: string
  inTheBox: string
}

export function blankForm(overrides: Partial<ProductFormState> = {}): ProductFormState {
  return {
    id: '',
    name: '',
    sku: '',
    category: 'parfum',
    subCategory: 'for-her',
    line: '',
    price: '',
    stock: '25',
    tag: 'New',
    short: '',
    description: '',
    status: 'published',
    images: '',
    concentration: '',
    volumes: '50ml, 100ml',
    perfumer: '',
    ingredients: '',
    notesTop: '',
    notesHeart: '',
    notesBase: '',
    specs: '',
    compatibility: 'iPhone, Android, USB-C devices',
    inTheBox: '',
    ...overrides,
  }
}

export function productToForm(p: CatalogProduct): ProductFormState {
  return blankForm({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    subCategory: p.subCategory || (p.category === 'tech' ? 'chargers' : 'for-her'),
    line: p.line,
    price: String(p.price),
    stock: String(p.stock),
    tag: p.tag,
    short: p.short,
    description: p.description,
    status: p.status,
    images: (p.images || []).join('\n'),
    concentration: p.concentration || '',
    volumes: (p.volumes || []).join(', '),
    perfumer: p.perfumer || '',
    ingredients: p.ingredients || '',
    notesTop: (p.notes?.top || []).join(', '),
    notesHeart: (p.notes?.heart || []).join(', '),
    notesBase: (p.notes?.base || []).join(', '),
    specs: p.specs
      ? Object.entries(p.specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
      : '',
    compatibility: (p.compatibility || []).join(', '),
    inTheBox: (p.inTheBox || []).join(', '),
  })
}

function splitList(value: string) {
  return value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseSpecs(value: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of value.split('\n')) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim()
    if (key) out[key] = val
  }
  return out
}

export function formToPayload(form: ProductFormState) {
  const images = form.images
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const base = {
    id: form.id.trim(),
    sku: form.sku.trim() || form.id.trim().toUpperCase(),
    name: form.name.trim(),
    category: form.category,
    subCategory: form.subCategory,
    line: form.line.trim() || (form.category === 'parfum' ? 'Maison Noir' : 'Accessories'),
    price: Number(form.price) || 0,
    stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
    tag: form.tag.trim() || 'New',
    short: form.short.trim(),
    description: form.description.trim(),
    status: form.status,
    images:
      images.length > 0
        ? images
        : ['https://placehold.co/800x1000/1a1a1a/c89b5c?text=Product'],
    rating: 4.8,
    reviews: [] as CatalogProduct['reviews'],
  }

  if (form.category === 'parfum') {
    return {
      ...base,
      concentration: form.concentration || undefined,
      volumes: splitList(form.volumes),
      perfumer: form.perfumer || undefined,
      ingredients: form.ingredients || undefined,
      notes: {
        top: splitList(form.notesTop),
        heart: splitList(form.notesHeart),
        base: splitList(form.notesBase),
      },
    }
  }

  return {
    ...base,
    specs: parseSpecs(form.specs),
    compatibility: splitList(form.compatibility),
    inTheBox: splitList(form.inTheBox),
  }
}

const inputClass =
  'w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c]'

type Props = {
  form: ProductFormState
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>
  idEditable?: boolean
}

export function ProductFormFields({ form, setForm, idEditable = true }: Props) {
  const set =
    (key: keyof ProductFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      setForm((prev) => {
        const next = { ...prev, [key]: value }
        if (key === 'category') {
          next.subCategory =
            value === 'tech' ? TECH_SUBS[0] : PARFUM_SUBS[0]
        }
        return next
      })
    }

  const subs = form.category === 'tech' ? TECH_SUBS : PARFUM_SUBS

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-subheading text-foreground mb-4">Basic Information</h3>
        <div className="space-y-4">
          <FormField label="Product Name" required>
            <input
              className={inputClass}
              value={form.name}
              onChange={set('name')}
              required
              placeholder="e.g. Oud Imperial"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="ID / Slug" required hint="Used in website URL /product/{id}">
              <input
                className={`${inputClass} font-mono text-sm`}
                value={form.id}
                onChange={set('id')}
                required
                disabled={!idEditable}
                placeholder="oud-imperial"
              />
            </FormField>
            <FormField label="SKU" required>
              <input
                className={`${inputClass} font-mono text-sm`}
                value={form.sku}
                onChange={set('sku')}
                required
                placeholder="OUD-IMPERIAL"
              />
            </FormField>
          </div>

          <FormField label="Short blurb" required>
            <input
              className={inputClass}
              value={form.short}
              onChange={set('short')}
              required
              placeholder="One-line product summary shown on cards"
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              value={form.description}
              onChange={set('description')}
              required
            />
          </FormField>
        </div>
      </div>

      <div className="border-t hairline-subtle pt-6">
        <h3 className="text-subheading text-foreground mb-4">Classification</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category" required>
            <select className={inputClass} value={form.category} onChange={set('category')}>
              <option value="parfum">Parfum (LEO SIGNATURE)</option>
              <option value="tech">Tech Hub (LEO TECH)</option>
            </select>
          </FormField>
          <FormField label="Sub-category" required>
            <select
              className={inputClass}
              value={form.subCategory}
              onChange={set('subCategory')}
            >
              {subs.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Line / Collection" required>
            <input
              className={inputClass}
              value={form.line}
              onChange={set('line')}
              required
              placeholder="Maison Noir / Audio"
            />
          </FormField>
          <FormField label="Tag / Badge">
            <input
              className={inputClass}
              value={form.tag}
              onChange={set('tag')}
              placeholder="New, Iconic, Bestseller…"
            />
          </FormField>
        </div>
      </div>

      <div className="border-t hairline-subtle pt-6">
        <h3 className="text-subheading text-foreground mb-4">Pricing & Inventory</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Price (EUR)" required>
            <div className="flex items-center">
              <span className="px-4 py-3 bg-[#0a0a0a] hairline text-[#a8a8a8] text-sm">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="flex-1 px-4 py-3 bg-[#0a0a0a] hairline-subtle text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] text-right"
                value={form.price}
                onChange={set('price')}
                required
              />
            </div>
          </FormField>
          <FormField label="Stock" required>
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.stock}
              onChange={set('stock')}
              required
            />
          </FormField>
        </div>
      </div>

      <div className="border-t hairline-subtle pt-6">
        <h3 className="text-subheading text-foreground mb-4">Images</h3>
        <FormField
          label="Image URLs"
          hint="One URL per line. First image is the primary card/gallery image."
        >
          <textarea
            className={`${inputClass} resize-none font-mono text-sm`}
            rows={4}
            value={form.images}
            onChange={set('images')}
            placeholder="https://…/product.jpg"
          />
        </FormField>
      </div>

      {form.category === 'parfum' ? (
        <div className="border-t hairline-subtle pt-6">
          <h3 className="text-subheading text-foreground mb-4">Perfume details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Concentration">
                <input className={inputClass} value={form.concentration} onChange={set('concentration')} />
              </FormField>
              <FormField label="Perfumer">
                <input className={inputClass} value={form.perfumer} onChange={set('perfumer')} />
              </FormField>
            </div>
            <FormField label="Volumes" hint="Comma-separated">
              <input className={inputClass} value={form.volumes} onChange={set('volumes')} />
            </FormField>
            <FormField label="Top notes" hint="Comma-separated">
              <input className={inputClass} value={form.notesTop} onChange={set('notesTop')} />
            </FormField>
            <FormField label="Heart notes" hint="Comma-separated">
              <input className={inputClass} value={form.notesHeart} onChange={set('notesHeart')} />
            </FormField>
            <FormField label="Base notes" hint="Comma-separated">
              <input className={inputClass} value={form.notesBase} onChange={set('notesBase')} />
            </FormField>
            <FormField label="Ingredients">
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                value={form.ingredients}
                onChange={set('ingredients')}
              />
            </FormField>
          </div>
        </div>
      ) : (
        <div className="border-t hairline-subtle pt-6">
          <h3 className="text-subheading text-foreground mb-4">Tech details</h3>
          <div className="space-y-4">
            <FormField label="Specs" hint="One per line: Key: Value">
              <textarea
                className={`${inputClass} resize-none font-mono text-sm`}
                rows={4}
                value={form.specs}
                onChange={set('specs')}
                placeholder={'Battery: 12h\nBluetooth: 5.3'}
              />
            </FormField>
            <FormField label="Compatibility" hint="Comma-separated">
              <input
                className={inputClass}
                value={form.compatibility}
                onChange={set('compatibility')}
              />
            </FormField>
            <FormField label="In the box" hint="Comma-separated">
              <input className={inputClass} value={form.inTheBox} onChange={set('inTheBox')} />
            </FormField>
          </div>
        </div>
      )}

      <div className="border-t hairline-subtle pt-6">
        <h3 className="text-subheading text-foreground mb-4">Publishing</h3>
        <FormField label="Status" hint="Only published products appear on the website">
          <div className="flex gap-4">
            {(['published', 'draft'] as const).map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={form.status === status}
                  onChange={set('status')}
                  className="w-4 h-4"
                />
                <span className="text-body-small text-foreground capitalize">{status}</span>
              </label>
            ))}
          </div>
        </FormField>
      </div>
    </div>
  )
}
