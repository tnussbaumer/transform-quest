import { useState, useRef } from 'react'
import { Camera } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { PRESET_AVATARS } from './Avatar'

interface AvatarPickerProps {
  userId: string
  currentPreset?: string
  currentAvatarUrl?: string | null
  currentAvatarType?: 'preset' | 'custom'
  onSelect: (update: { avatar_type: 'preset' | 'custom'; avatar_preset: string; avatar_url: string | null }) => void
}

async function resizeImage(file: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let w = img.width
      let h = img.height
      if (w > maxSize || h > maxSize) {
        if (w > h) {
          h = Math.round((h * maxSize) / w)
          w = maxSize
        } else {
          w = Math.round((w * maxSize) / h)
          h = maxSize
        }
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Failed to compress image')),
        'image/webp',
        0.8
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

export function AvatarPicker({ userId, currentPreset, currentAvatarUrl, currentAvatarType, onSelect }: AvatarPickerProps) {
  const [selected, setSelected] = useState(currentAvatarType === 'custom' ? '__custom__' : (currentPreset ?? 'default'))
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentAvatarType === 'custom' ? (currentAvatarUrl ?? null) : null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePresetClick(key: string) {
    setSelected(key)
    setError('')
    onSelect({ avatar_type: 'preset', avatar_preset: key, avatar_url: null })
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)

    try {
      const blob = await resizeImage(file, 256)
      const path = `${userId}/avatar.webp`

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { contentType: 'image/webp', upsert: true })

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

      setUploadedUrl(publicUrl)
      setSelected('__custom__')
      onSelect({ avatar_type: 'custom', avatar_preset: 'default', avatar_url: publicUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const presetKeys = Object.keys(PRESET_AVATARS)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 justify-center">
        {presetKeys.map(key => {
          const preset = PRESET_AVATARS[key]
          const isSelected = selected === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => handlePresetClick(key)}
              className={[
                'w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center',
                'transition-all duration-200',
                preset.bg,
                isSelected
                  ? 'ring-[3px] ring-tq-teal ring-offset-2 ring-offset-tq-bg scale-110'
                  : 'opacity-70 hover:opacity-100 hover:scale-105',
              ].join(' ')}
              aria-label={`Select ${key} avatar`}
            >
              <span className="text-2xl">{preset.emoji}</span>
            </button>
          )
        })}

        {/* Upload photo option */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={[
            'w-16 h-16 rounded-full flex flex-col items-center justify-center gap-0.5',
            'bg-tq-surface-2 border-2 border-dashed border-tq-border',
            'transition-all duration-200',
            selected === '__custom__' && uploadedUrl
              ? 'ring-[3px] ring-tq-teal ring-offset-2 ring-offset-tq-bg scale-110'
              : 'opacity-70 hover:opacity-100 hover:scale-105',
            uploading ? 'animate-pulse' : '',
          ].join(' ')}
          aria-label="Upload photo"
        >
          {selected === '__custom__' && uploadedUrl ? (
            <img src={uploadedUrl} alt="Your photo" className="w-full h-full rounded-full object-cover" />
          ) : (
            <>
              <Camera size={18} className="text-tq-text-muted" />
              <span className="text-[9px] font-bold text-tq-text-muted">Photo</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-tq-error text-xs text-center">{error}</p>}
      {uploading && <p className="text-tq-text-muted text-xs text-center">Uploading...</p>}
    </div>
  )
}
