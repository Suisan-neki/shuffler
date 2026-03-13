import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useFlashStore } from '../store/flashStore'

export default function MemoPanel() {
  const {
    imageSets,
    homeMemoImageId,
    closeMemoPanel,
    sessionImages,
    currentIndex,
    memoPanelOpen,
    toggleMemoPanel,
    updateMemo,
  } = useFlashStore()

  const homeImage = homeMemoImageId
    ? imageSets.flatMap((s) => s.images).find((img) => img.id === homeMemoImageId)
    : null
  const flashImage = sessionImages[currentIndex]

  const isHomeMode = homeImage != null
  const image = isHomeMode ? homeImage : flashImage

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

  // ── ホームモード：ボトムシート ─────────────────────────────────────
  if (isHomeMode && homeImage) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeMemoPanel} />
        <div className="fixed inset-x-0 bottom-0 z-50 bg-gray-900 rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-800">
            <p className="text-sm text-gray-400 truncate max-w-[70%]">{homeImage.name}</p>
            <button onClick={closeMemoPanel} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-1 overflow-hidden min-h-0">
            <div className="w-1/2 flex-shrink-0 p-3 flex items-center justify-center bg-black">
              <img src={homeImage.src} alt={homeImage.name} className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
            <div className="flex-1 flex flex-col p-3 border-l border-gray-800">
              <p className="text-xs text-gray-500 mb-2">メモ</p>
              <textarea
                value={localMemo}
                onChange={(e) => handleMemoChange(e.target.value)}
                placeholder="ここにメモを入力..."
                className="flex-1 resize-none bg-gray-800 text-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
              />
              <p className="text-xs text-gray-600 mt-2 text-right">自動保存</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── フラッシュモード：右サイドバー ────────────────────────────────
  if (!flashImage) return null

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          memoPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMemoPanel}
      />
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          memoPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-800">
          <p className="text-sm text-gray-400 truncate max-w-[80%]">{flashImage.name}</p>
          <button onClick={toggleMemoPanel} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <div className="flex-shrink-0 p-3 bg-black flex items-center justify-center" style={{ height: '40%' }}>
          <img src={flashImage.src} alt={flashImage.name} className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
        <div className="flex-1 flex flex-col p-3 border-t border-gray-800 min-h-0">
          <p className="text-xs text-gray-500 mb-2">メモ</p>
          <textarea
            value={localMemo}
            onChange={(e) => handleMemoChange(e.target.value)}
            placeholder="ここにメモを入力..."
            className="flex-1 resize-none bg-gray-800 text-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
          />
          <p className="text-xs text-gray-600 mt-2 text-right">自動保存</p>
        </div>
      </div>
    </>
  )
}
