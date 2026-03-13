import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FlashViewer from '../components/FlashViewer'
import MemoPanel from '../components/MemoPanel'
import { useFlashStore } from '../store/flashStore'

export default function Flash() {
  const navigate = useNavigate()
  const sessionImages = useFlashStore((s) => s.sessionImages)

  // セッションが空ならホームへ
  useEffect(() => {
    if (sessionImages.length === 0) {
      navigate('/')
    }
  }, [sessionImages.length, navigate])

  if (sessionImages.length === 0) return null

  return (
    <>
      <FlashViewer />
      <MemoPanel />
    </>
  )
}
