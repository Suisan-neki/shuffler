import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useFlashStore } from '../store/flashStore'

export default function MemoPanel() {
  const { imageSets, memoPanelImageId, closeMemoPanel, updateMemo } = useFlashStore()

  const allImages = imageSets.flatMap((s) => s.images)
  const image = allImages.find((img) => img.id === memoPanelImageId)

  const [localMemo, setLocalMemo] = useState(image?.memo ?? '')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 画像が変わったらローカル状態もリセット
  useEffect(() => {
    setLocalMemo(image?.memo ?? '')
  }, [image?.id, image?.memo])

  const handleMemoChange = (text: string) => {
    setLocalMemo(text)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      if (memoPanelImageId) updateMemo(memoPanelImageId, text)
    }, 500)
  }

  if (!image) return null

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeMemoPanel}
      />

      {/* パネル */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-gray-900 rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-800">
          <p className="text-sm text-gray-400 truncate max-w-[70%]">{image.name}</p>
          <button
            onClick={closeMemoPanel}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* ボディ */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* 画像 */}
          <div className="w-1/2 flex-shrink-0 p-3 flex items-center justify-center bg-black">
            <img
              src={image.src}
              alt={image.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* メモ入力 */}
          <div className="flex-1 flex flex-col p-3 border-l border-gray-800">
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
            <p className="text-xs text-gray-600 mt-2 text-right">
              自動保存
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
