import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Flash from './pages/Flash'
import { useFlashStore } from './store/flashStore'

export default function App() {
  const hydrate = useFlashStore((s) => s.hydrate)

  useEffect(() => {
    hydrate().catch(console.error)
  }, [hydrate])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flash" element={<Flash />} />
      </Routes>
    </BrowserRouter>
  )
}
