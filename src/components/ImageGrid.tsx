import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, StickyNote, Star, Trash2, X } from 'lucide-react'
import { useFlashStore } from '../store/flashStore'
import type { ImageItem } from '../types'

interface ImageCardProps {
  image: ImageItem
  selected: boolean
  selectionMode: boolean
  onLongPress: () => void
  onTap: () => void
  onMemo: () => void
  onDoubleClick: () => void
}

function ImageCard({
  image,
  selected,
  selectionMode,
  onLongPress,
  onTap,
  onMemo,
  onDoubleClick,
}: ImageCardProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const movedRef = useRef(false)

  const startPress = () => {
    movedRef.current = false
    timerRef.current = setTimeout(() => {
      if (!movedRef.current) onLongPress()
    }, 500)
  }

  const endPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const cancelPress = () => {
    movedRef.current = true
    endPress()
  }

  return (
    <div className="relative group" style={{ aspectRatio: '3/4' }}>
      <div
        className={`
          w-full h-full overflow-hidden rounded-xl cursor-pointer
          transition-all duration-150 select-none
          ${selected
            ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-950'
            : 'ring-1 ring-gray-800'
          }
        `}
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        onTouchMove={cancelPress}
        onClick={onTap}
        onDoubleClick={onDoubleClick}
      >
        <img
          src={image.src}
          alt={image.name}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* 選択チェック */}
        {selectionMode && (
          <div
            className={`
              absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center
              border-2 transition-colors
              ${selected
                ? 'bg-blue-500 border-blue-500'
                : 'bg-black/40 border-white/60'
              }
            `}
          >
            {selected && <Check size={14} strokeWidth={3} className="text-white" />}
          </div>
        )}

        {/* アイコン群 */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {image.bookmarked && (
            <div className="w-5 h-5 bg-yellow-400/90 rounded-full flex items-center justify-center">
              <Star size={10} className="text-gray-900" fill="currentColor" />
            </div>
          )}
          {image.memo && (
            <div className="w-5 h-5 bg-blue-500/80 rounded-full flex items-center justify-center">
              <StickyNote size={10} className="text-white" />
            </div>
          )}
        </div>
      </div>

      {/* メモボタン（非選択モード時のみ） */}
      {!selectionMode && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMemo()
          }}
          className="
            absolute bottom-2 left-2
            bg-black/60 hover:bg-black/80 text-white text-xs
            px-2 py-0.5 rounded-full
            opacity-0 group-hover:opacity-100 transition-opacity
          "
        >
          memo
        </button>
      )}
    </div>
  )
}

export default function ImageGrid() {
  const {
    imageSets,
    activeSetId,
    selectionMode,
    selectedIds,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelect,
    openMemoPanel,
    startSession,

    selectAll,
    deselectAll,
    deleteImages,
  } = useFlashStore()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [bookmarkFilter, setBookmarkFilter] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const activeSet = imageSets.find((s) => s.id === activeSetId)
  const allImages = activeSet?.images ?? []
  const bookmarkedImages = allImages.filter((img) => img.bookmarked)
  const images = bookmarkFilter ? bookmarkedImages : allImages

  const previewImage = previewIndex !== null ? images[previewIndex] : null

  useEffect(() => {
    if (previewIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewIndex(null)
      else if (e.key === 'ArrowRight') setPreviewIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : i))
      else if (e.key === 'ArrowLeft') setPreviewIndex((i) => (i !== null && i > 0 ? i - 1 : i))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [previewIndex, images.length])

  const handleLongPress = useCallback(
    (id: string) => {
      if (!selectionMode) {
        enterSelectionMode()
        toggleSelect(id)
      }
    },
    [selectionMode, enterSelectionMode, toggleSelect]
  )

  const handleTap = useCallback(
    (id: string) => {
      if (selectionMode) {
        toggleSelect(id)
      }
    },
    [selectionMode, toggleSelect]
  )

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    deleteImages(Array.from(selectedIds))
    setConfirmDelete(false)
  }

  const handleStartFlash = () => {
    const targets =
      selectedIds.size > 0
        ? images.filter((img) => selectedIds.has(img.id))
        : images
    startSession(targets)
  }

  if (images.length === 0) return null

  const allSelected = images.every((img) => selectedIds.has(img.id))

  return (
    <div className="flex flex-col gap-4">
      {/* ツールバー */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <p className="text-gray-400 text-sm">
            {images.length} 枚
            {selectionMode && selectedIds.size > 0 && ` / ${selectedIds.size} 枚選択中`}
          </p>
          {bookmarkedImages.length > 0 && (
            <button
              onClick={() => setBookmarkFilter((v) => !v)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                bookmarkFilter
                  ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40'
                  : 'bg-gray-800 text-gray-400 hover:text-yellow-400'
              }`}
            >
              <Star size={11} fill={bookmarkFilter ? 'currentColor' : 'none'} />
              苦手のみ ({bookmarkedImages.length})
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {selectionMode ? (
            <>
              <button
                onClick={allSelected ? deselectAll : selectAll}
                className="text-sm px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200"
              >
                {allSelected ? '全解除' : '全選択'}
              </button>

              {/* 削除ボタン（選択中のみ表示） */}
              {selectedIds.size > 0 && (
                <button
                  onClick={handleDelete}
                  onBlur={() => setConfirmDelete(false)}
                  className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors
                    ${confirmDelete
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-gray-800 hover:bg-red-900/60 text-red-400'
                    }`}
                >
                  <Trash2 size={14} />
                  {confirmDelete ? `本当に削除 (${selectedIds.size}枚)` : `削除 (${selectedIds.size})`}
                </button>
              )}

              <button
                onClick={() => { exitSelectionMode(); setConfirmDelete(false) }}
                className="text-sm px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200"
              >
                キャンセル
              </button>
            </>
          ) : (
            <button
              onClick={enterSelectionMode}
              className="text-sm px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200"
            >
              選択
            </button>
          )}

          <button
            onClick={handleStartFlash}
            className="text-sm px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
          >
            {selectionMode && selectedIds.size > 0
              ? `${selectedIds.size}枚でスタート`
              : 'フラッシュ開始'}
          </button>
        </div>
      </div>

      {/* グリッド */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {images.map((img, idx) => (
          <ImageCard
            key={img.id}
            image={img}
            selected={selectedIds.has(img.id)}
            selectionMode={selectionMode}
            onLongPress={() => handleLongPress(img.id)}
            onTap={() => handleTap(img.id)}
            onMemo={() => openMemoPanel(img.id)}
            onDoubleClick={() => { setPreviewIndex(idx); openMemoPanel(img.id) }}
          />
        ))}
      </div>

      {/* ライトボックス */}
      {previewImage && previewIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setPreviewIndex(null)}
        >
          {/* 閉じるボタン */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 text-white hover:bg-gray-700"
            onClick={() => setPreviewIndex(null)}
          >
            <X size={20} />
          </button>

          {/* 枚数 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm font-mono">
            {previewIndex + 1} / {images.length}
          </div>

          {/* 画像 */}
          <img
            src={previewImage.src}
            alt={previewImage.name}
            className="max-w-full max-h-full object-contain select-none"
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {/* 前へ */}
          {previewIndex > 0 && (
            <button
              className="absolute left-3 p-2 rounded-full bg-gray-800/80 text-white hover:bg-gray-700"
              onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex - 1) }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* 次へ */}
          {previewIndex < images.length - 1 && (
            <button
              className="absolute right-3 p-2 rounded-full bg-gray-800/80 text-white hover:bg-gray-700"
              onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex + 1) }}
            >
              <ChevronRight size={24} />
            </button>
          )}

        </div>
      )}
    </div>
  )
}
