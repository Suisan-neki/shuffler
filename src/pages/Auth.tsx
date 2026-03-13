import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Auth() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuthStore()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (mode === 'login') {
      const err = await signIn(email, password)
      if (err) {
        setError(err)
      } else {
        navigate('/')
      }
    } else {
      const err = await signUp(email, password)
      if (err) {
        setError(err)
      } else {
        setMessage('確認メールを送信しました。メールのリンクをクリックしてからログインしてください。')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <BookOpen size={24} className="text-blue-400" />
          <span className="text-xl font-semibold text-white">フラッシュカード</span>
        </div>

        {/* カード */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          {/* タブ */}
          <div className="flex mb-6 bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => { setMode('login'); setError(null); setMessage(null) }}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setMessage(null) }}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 text-gray-100 rounded-xl px-3 py-2.5 text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-gray-800 text-gray-100 rounded-xl px-3 py-2.5 text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
                placeholder="6文字以上"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}
            {message && (
              <p className="text-green-400 text-xs">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録'}
            </button>
          </form>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full text-center text-gray-600 hover:text-gray-400 text-sm"
        >
          ← ホームに戻る
        </button>
      </div>
    </div>
  )
}
