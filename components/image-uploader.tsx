'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  onImagesChange: (images: ProductImage[]) => void
  maxImages?: number
  maxSizePerImage?: number // in MB
}

export interface ProductImage {
  id: string
  src: string
  alt: string
  isPrimary: boolean
}

export function ImageUploader({ onImagesChange, maxImages = 5, maxSizePerImage = 10 }: ImageUploaderProps) {
  const [images, setImages] = useState<ProductImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const newImages: ProductImage[] = []

    fileArray.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.warn(`[v0] Skipped non-image file: ${file.name}`)
        return
      }

      // Validate file size
      const fileSizeInMB = file.size / (1024 * 1024)
      if (fileSizeInMB > maxSizePerImage) {
        console.warn(`[v0] File ${file.name} exceeds max size of ${maxSizePerImage}MB`)
        return
      }

      // Check max images limit
      if (images.length + newImages.length >= maxImages) {
        console.warn(`[v0] Maximum ${maxImages} images allowed`)
        return
      }

      // Read file as data URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        const imageId = `img-${Date.now()}-${Math.random()}`
        const isPrimary = images.length + newImages.length === 0 // First image is primary

        const productImage: ProductImage = {
          id: imageId,
          src: base64,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          isPrimary,
        }

        setImages((prev) => {
          const updated = [...prev, productImage]
          onImagesChange(updated)
          return updated
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id)
      // If removed image was primary, make first remaining image primary
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true
      }
      onImagesChange(updated)
      return updated
    })
  }

  const handleSetPrimary = (id: string) => {
    setImages((prev) => {
      const updated = prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
      onImagesChange(updated)
      return updated
    })
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed p-8 rounded-none cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#c89b5c] bg-[#0a0a0a]/50'
            : 'border-[#333333] hover:border-[#c89b5c] bg-[#0a0a0a]/20 hover:bg-[#0a0a0a]/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="p-3 bg-[#2a2a2a] rounded-none hairline">
            <Upload className="w-6 h-6 text-[#c89b5c]" />
          </div>
          <div className="text-center">
            <p className="text-body font-medium text-foreground">
              {isDragging ? 'Drop images here' : 'Drag images or click to upload'}
            </p>
            <p className="text-body-small text-[#a8a8a8] mt-1">
              PNG, JPG, WebP up to {maxSizePerImage}MB each
            </p>
          </div>
          <p className="text-code text-[#707070]">
            {images.length} / {maxImages} images uploaded
          </p>
        </div>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="bg-[#1a1a1a] hairline p-4">
          <h4 className="text-body-small font-medium text-foreground mb-4">Uploaded Images</h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group overflow-hidden hairline bg-[#0a0a0a]"
              >
                {/* Image */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-32 object-cover"
                />

                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-[#c89b5c] text-[#0a0a0a] px-2 py-1 text-code font-medium">
                    Primary
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!image.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(image.id)}
                      className="px-3 py-1.5 bg-[#c89b5c] text-[#0a0a0a] text-code font-medium hover:bg-[#e8c989] transition-colors"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    className="p-1.5 bg-[#a85c5c] hover:bg-[#c97c7c] transition-colors rounded-none"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Alt Text */}
                <div className="p-2 border-t hairline-subtle">
                  <p className="text-code text-[#a8a8a8] truncate">{image.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
