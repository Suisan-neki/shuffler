import { useCallback, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { parsePDF } from '../lib/pdfParser'
import { hashBlob } from '../lib/hash'
import { getMemo } from '../lib/indexedDB'
import { useFlashStore } from '../store/flashStore'
import type { ImageItem, ImageSet } from '../types'

interface UploadProps {
  onDone?: () => void
}

export default function Upload({ onDone }: UploadProps) {
  const addImageSet = useFlashStore((s) => s.addImageSet)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      setLoading(true)
      setProgress(null)

      try {
        const allImages: ImageItem[] = []
        // id → Blob のマップ（IndexedDB 保存用）
        const blobMap = new Map<string, Blob>()

        for (const file of fileArray) {
          if (file.type === 'application/pdf') {
            const pages = await parsePDF(file, (current, total) => {
              setProgress({ current, total })
            })

            for (const page of pages) {
              const hash = await hashBlob(page.blob)
              const savedMemo = await getMemo(hash)
              const id = crypto.randomUUID()
              const src = URL.createObjectURL(page.blob)
              allImages.push({
                id,
                src,
                hash,
                memo: savedMemo,
                name: `${file.name} - p.${page.pageNumber}`,
              })
              blobMap.set(id, page.blob)
            }
          } else if (file.type.startsWith('image/')) {
            const hash = await hashBlob(file)
            const savedMemo = await getMemo(hash)
            const id = crypto.randomUUID()
            const src = URL.createObjectURL(file)
            allImages.push({
              id,
              src,
              hash,
              memo: savedMemo,
              name: file.name,
            })
            blobMap.set(id, file)
          }
        }

        if (allImages.length === 0) return

        const setName =
          fileArray.length === 1
            ? fileArray[0].name
            : `${fileArray.length} ファイル`

        const imageSet: ImageSet = {
          id: crypto.randomUUID(),
          name: setName,
          images: allImages,
        }

        addImageSet(imageSet, blobMap)
        onDone?.()
      } finally {
        setLoading(false)
        setProgress(null)
      }
    },
    [addImageSet, onDone]
  )

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files)
  }

  return (
    <label
      className={`
        flex flex-col items-center justify-center gap-4
        border-2 border-dashed rounded-2xl
        p-12 cursor-pointer select-none transition-colors
        ${dragging
          ? 'border-blue-400 bg-blue-950/30'
          : 'border-gray-700 hover:border-gray-500 bg-gray-900/50'
        }
      `}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept="application/pdf,image/*"
        multiple
        className="hidden"
        onChange={onFileChange}
        disabled={loading}
      />

      {loading ? (
        <>
          <Loader2 size={48} className="text-blue-400 animate-spin" />
          {progress ? (
            <p className="text-gray-300">
              処理中 {progress.current} / {progress.total} ページ
            </p>
          ) : (
            <p className="text-gray-300">読み込み中...</p>
          )}
        </>
      ) : (
        <>
          <UploadCloud size={48} className="text-gray-500" />
          <div className="text-center">
            <p className="text-gray-200 font-medium">
              PDF または 画像をドロップ
            </p>
            <p className="text-gray-500 text-sm mt-1">
              クリックしてファイルを選択
            </p>
          </div>
        </>
      )}
    </label>
  )
}
