import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, X, StickyNote, Star } from 'lucide-react'
import { useFlashStore } from '../store/flashStore'
import { useNavigate } from 'react-router-dom'

export default function FlashViewer() {
  const {
    sessionImages,
    currentIndex,
    paused,
    nextCard,
    prevCard,
    togglePause,
    endSession,
    toggleMemoPanel,
    memoPanelOpen,
    toggleBookmark,
    flashDuration,
  } = useFlashStore()

  const navigate = useNavigate()
  const image = sessionImages[currentIndex]
  const total = sessionImages.length
  const isLast = currentIndex === total - 1

  // 一時停止した時点の残り割合 (0〜1) を保持
  const [pausedRatio, setPausedRatio] = useState<number | null>(null)
  const cardStartRef = useRef(Date.now())   // このカードの表示開始時刻
  const pausedAtRef = useRef<number | null>(null)  // 一時停止した時刻

  // カードが切り替わったらリセット
  useEffect(() => {
    cardStartRef.current = Date.now()
    pausedAtRef.current = null
    setPausedRatio(null)
  }, [currentIndex])

  // 一時停止・再開のタイミングで残り割合を記録
  useEffect(() => {
    if (paused) {
      const elapsed = (Date.now() - cardStartRef.current) / 1000
      const remaining = Math.max(0, flashDuration - elapsed)
      setPausedRatio(remaining / flashDuration)
      pausedAtRef.current = Date.now()
    } else {
      if (pausedAtRef.current !== null) {
        // 一時停止していた分だけ開始時刻を後ろにずらして継続
        cardStartRef.current += Date.now() - pausedAtRef.current
        pausedAtRef.current = null
      }
      setPausedRatio(null)
    }
  }, [paused, flashDuration])

  // ── 自動切替タイマー ─────────────────────────────────────────
  // currentIndex / paused が変わるたびに setTimeout をリセット。
  // 手動操作（矢印・Space）でも必ずMaxから再スタートする。
  useEffect(() => {
    if (paused || sessionImages.length === 0) return

    // 再開時は残り時間だけ待つ、新しいカードは全秒数待つ
    const elapsed = pausedAtRef.current !== null
      ? (pausedAtRef.current - cardStartRef.current) / 1000
      : 0
    const wait = Math.max(0, (flashDuration - elapsed)) * 1000

    const timer = setTimeout(() => {
      if (isLast) {
        endSession()
        navigate('/')
      } else {
        nextCard()
      }
    }, wait)

    return () => clearTimeout(timer)
  // currentIndex/paused の変化だけをトリガーにする。
  // nextCard 等は Zustand の安定した参照なので外しても安全。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, paused, sessionImages.length])

  // ── キーボードショートカット ──────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        nextCard()
      } else if (e.key === 'ArrowRight') {
        nextCard()
      } else if (e.key === 'ArrowLeft') {
        prevCard()
      } else if (e.key === 'p' || e.key === 'P') {
        togglePause()
      } else if (e.key === 'Escape') {
        endSession()
        navigate('/')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [nextCard, prevCard, togglePause, endSession, navigate])

  if (!image) return null

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* 進捗バー */}
      <div className="h-1 w-full bg-gray-800 overflow-hidden">
        {paused ? (
          // 一時停止中：残り幅のまま静止
          <div
            className="h-full bg-blue-500 transition-none"
            style={{ width: `${(pausedRatio ?? 1) * 100}%` }}
          />
        ) : (
          // 再生中：key でカード切替時に再マウント → アニメーション確実リセット
          <div
            key={currentIndex}
            className="h-full bg-blue-500"
            style={{
              animation: `progress-shrink ${flashDuration}s linear forwards`,
            }}
          />
        )}
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80">
        <button
          onClick={() => { endSession(); navigate('/') }}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
        >
          <X size={20} />
        </button>

        <span className="text-gray-400 text-sm font-mono">
          {currentIndex + 1} / {total}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleBookmark(image.id)}
            className={`p-2 rounded-lg ${image.bookmarked ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Star size={20} fill={image.bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={toggleMemoPanel}
            className={`p-2 rounded-lg text-gray-400 ${memoPanelOpen ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
          >
            <StickyNote size={20} />
          </button>
        </div>
      </div>

      {/* 画像エリア */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
        <img
          key={image.id}
          src={image.src}
          alt={image.name}
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
      </div>

      {/* メモ表示 */}
      {image.memo && (
        <div className="mx-4 mb-2 px-3 py-2 bg-gray-900/80 rounded-xl text-sm text-gray-300 max-h-24 overflow-y-auto">
          {image.memo}
        </div>
      )}

      {/* コントロール */}
      <div className="flex items-center justify-center gap-6 py-4 bg-black">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={togglePause}
          className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          {paused ? <Play size={24} fill="white" /> : <Pause size={24} fill="white" />}
        </button>

        <button
          onClick={nextCard}
          disabled={isLast}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* ショートカットヒント */}
      <div className="text-center pb-3 text-gray-700 text-xs">
        Space / →: 次へ　←: 戻る　P: 一時停止　Esc: 終了
      </div>
    </div>
  )
}
