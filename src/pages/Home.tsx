import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Plus, User, LogOut, LogIn } from 'lucide-react'
import Upload from '../components/Upload'
import ImageGrid from '../components/ImageGrid'
import MemoPanel from '../components/MemoPanel'
import FlashSettings from '../components/FlashSettings'
import { useFlashStore } from '../store/flashStore'
import { useAuthStore } from '../store/authStore'

export default function Home() {
  const navigate = useNavigate()
  const { imageSets, activeSetId, setActiveSet, sessionImages, hydrated } = useFlashStore()
  const { user, signOut } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // セッションが開始されたら Flash ページへ
  useEffect(() => {
    if (sessionImages.length > 0) {
      navigate('/flash')
    }
  }, [sessionImages.length, navigate])

  const activeSet = imageSets.find((s) => s.id === activeSetId)
  const hasImages = (activeSet?.images.length ?? 0) > 0

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ヘッダー */}
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-blue-400" />
            <span className="font-semibold text-white">フラッシュカード</span>
          </div>

          <div className="flex items-center gap-2">
            {/* セット切り替え */}
            {imageSets.length > 1 && (
              <select
                value={activeSetId ?? ''}
                onChange={(e) => setActiveSet(e.target.value)}
                className="bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none"
              >
                {imageSets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {/* ユーザーメニュー */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm"
                >
                  <User size={14} />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </button>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
                      <button
                        onClick={() => { signOut(); setShowUserMenu(false) }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700"
                      >
                        <LogOut size={14} />
                        ログアウト
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm"
              >
                <LogIn size={14} />
                ログイン
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 復元待機中 */}
        {!hydrated ? (
          <div className="flex justify-center py-20 text-gray-600 text-sm">読み込み中...</div>
        ) : !hasImages ? (
          <Upload />
        ) : (
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-gray-300 select-none list-none">
              <Plus size={16} className="group-open:rotate-45 transition-transform" />
              ファイルを追加
            </summary>
            <div className="mt-3">
              <Upload />
            </div>
          </details>
        )}

        {/* 設定 */}
        {hydrated && hasImages && <FlashSettings />}

        {/* グリッド */}
        {hydrated && <ImageGrid />}
      </main>

      {/* メモパネル */}
      <MemoPanel />
    </div>
  )
}
