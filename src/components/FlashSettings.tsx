import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useFlashStore } from '../store/flashStore'

const DURATIONS = [10, 15, 30] as const
const PRESET_COUNTS = [10, 20, 50, 'ALL'] as const
type Preset = typeof PRESET_COUNTS[number]

export default function FlashSettings() {
  const {
    flashDuration,
    flashCardCount,
    repeatMode,
    setFlashDuration,
    setFlashCardCount,
    setRepeatMode,
  } = useFlashStore()

  const isPreset = (PRESET_COUNTS as readonly (number | string)[]).includes(flashCardCount)
  const [customInput, setCustomInput] = useState(
    !isPreset && typeof flashCardCount === 'number' ? String(flashCardCount) : ''
  )
  const [customActive, setCustomActive] = useState(!isPreset)

  const handlePreset = (c: Preset) => {
    setFlashCardCount(c)
    setCustomActive(false)
    setCustomInput('')
  }

  const handleCustomChange = (raw: string) => {
    setCustomInput(raw)
    const n = parseInt(raw, 10)
    if (!isNaN(n) && n >= 1) setFlashCardCount(n)
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-4 space-y-4">
      <p className="text-sm font-medium text-gray-300">フラッシュ設定</p>

      {/* 秒数 */}
      <div>
        <p className="text-xs text-gray-500 mb-2">カード秒数</p>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setFlashDuration(d)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors
                ${flashDuration === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {d}秒
            </button>
          ))}
        </div>
      </div>

      {/* 枚数 */}
      <div>
        <p className="text-xs text-gray-500 mb-2">カード枚数</p>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COUNTS.map((c) => (
            <button
              key={c}
              onClick={() => handlePreset(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${!customActive && flashCardCount === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {c === 'ALL' ? 'ALL' : `${c}枚`}
            </button>
          ))}

          {/* カスタム入力 */}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              placeholder="任意"
              value={customInput}
              onFocus={() => setCustomActive(true)}
              onChange={(e) => handleCustomChange(e.target.value)}
              className={`w-16 py-2 px-2 rounded-xl text-sm text-center font-medium
                bg-gray-800 text-gray-200 border focus:outline-none transition-colors
                [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                ${customActive ? 'border-blue-500' : 'border-transparent hover:border-gray-600'}
              `}
            />
            <span className="text-xs text-gray-500">枚</span>
          </div>
        </div>
      </div>

      {/* 重複ありモード */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-800">
        <div>
          <p className="text-sm text-gray-300 flex items-center gap-1.5">
            <RefreshCw size={13} className="text-gray-500" />
            重複ありモード
          </p>
          <p className="text-xs text-gray-600 mt-0.5 ml-5">
            同じ画像が複数回出現する可能性あり
          </p>
        </div>
        <button
          onClick={() => setRepeatMode(!repeatMode)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
            ${repeatMode ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
              ${repeatMode ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
    </div>
  )
}
