import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Flash from './pages/Flash'
import Auth from './pages/Auth'
import { useFlashStore } from './store/flashStore'
import { useAuthStore } from './store/authStore'

export default function App() {
  const hydrate = useFlashStore((s) => s.hydrate)
  const syncMemosFromCloud = useFlashStore((s) => s.syncMemosFromCloud)
  const initAuth = useAuthStore((s) => s.init)

  useEffect(() => {
    hydrate().catch(console.error)
    const unsub = initAuth(() => {
      syncMemosFromCloud().catch(console.error)
    })
    return unsub
  }, [hydrate, initAuth, syncMemosFromCloud])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flash" element={<Flash />} />
        <Route path="/login" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}
