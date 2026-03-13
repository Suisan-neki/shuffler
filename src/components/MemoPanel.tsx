import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useFlashStore } from '../store/flashStore'

export default function MemoPanel() {
  const { imageSets, sessionImages, currentIndex, memoPanelOpen, memoPanelImageId, closeMemoPanel, updateMemo } = useFlashStore()

  const allImages = useMemo(() => imageSets.flatMap((s) => s.images), [imageSets])
  const image = (memoPanelImageId
    ? allImages.find((img) => img.id === memoPanelImageId)
    : null) ?? sessionImages[currentIndex]

  const [localMemo, setLocalMemo] = useState(image?.memo ?? '')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalMemo(image?.memo ?? '')
  }, [image?.id, image?.memo])

  const handleMemoChange = (text: string) => {
    setLocalMemo(text)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      if (image?.id) updateMemo(image.id, text)
    }, 500)
  }

  if (!image) return null

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          memoPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMemoPanel}
      />

      {/* サイドバー */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          memoPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-800">
          <p className="text-sm text-gray-400 truncate max-w-[80%]">{image.name}</p>
          <button
            onClick={closeMemoPanel}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* 画像プレビュー */}
        <div className="flex-shrink-0 p-3 bg-black flex items-center justify-center" style={{ height: '40%' }}>
          <img
            src={image.src}
            alt={image.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        {/* メモ入力 */}
        <div className="flex-1 flex flex-col p-3 border-t border-gray-800 min-h-0">
          <p className="text-xs text-gray-500 mb-2">メモ</p>
          <textarea
            value={localMemo}
            onChange={(e) => handleMemoChange(e.target.value)}
            placeholder="ここにメモを入力..."
            className="
              flex-1 resize-none bg-gray-800 text-gray-100
              rounded-xl p-3 text-sm
              focus:outline-none focus:ring-1 focus:ring-blue-500
              placeholder-gray-600
            "
          />
          <p className="text-xs text-gray-600 mt-2 text-right">自動保存</p>
        </div>
      </div>
    </>
  )
}
