'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { uploadRoundPhoto, deleteRoundPhoto } from '@/app/actions/photos'

interface Photo {
  id: string
  url: string
  caption?: string
  createdAt: string
}

interface PhotoUploadProps {
  roundId: string
  existingPhotos?: Photo[]
}

export default function PhotoUpload({ roundId, existingPhotos = [] }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [captions, setCaptions] = useState<Record<number, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newPreviews: string[] = []
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          newPreviews.push(reader.result)
          setPreviews(prev => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleUpload = async (file: File, index: number) => {
    setUploading(true)
    setError(null)

    try {
      const result = await uploadRoundPhoto({
        roundId,
        file,
        caption: captions[index] || undefined
      })

      if (result.error) {
        setError(result.error)
      } else if (result.success && result.photo) {
        setPhotos(prev => [result.photo, ...prev])
        setPreviews(prev => prev.filter((_, i) => i !== index))
      }
    } catch {
      setError('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId: string) => {
    const result = await deleteRoundPhoto(photoId)
    
    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    }
  }

  const handleCaptionChange = (index: number, value: string) => {
    setCaptions(prev => ({ ...prev, [index]: value }))
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          📷 Select Photos
        </button>
        <p className="mt-2 text-xs text-gray-500">JPG, PNG up to 5MB</p>
      </div>

      {/* Preview Uploads */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Ready to Upload</h4>
          {previews.map((preview, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Add a caption..."
                    value={captions[index] || ''}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    className="block w-full rounded-md border-gray-300 text-sm px-3 py-2 border mb-2"
                  />
                  <button
                    onClick={() => {
                      const fileInput = fileInputRef.current
                      if (fileInput?.files?.[index]) {
                        handleUpload(fileInput.files[index], index)
                      }
                    }}
                    disabled={uploading}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Photos */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Photos ({photos.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="relative aspect-square">
                  <Image
                    src={photo.url}
                    alt={photo.caption || 'Round photo'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                {photo.caption && (
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">{photo.caption}</p>
                )}
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && previews.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No photos yet. Add some memories from your round!</p>
      )}
    </div>
  )
}
