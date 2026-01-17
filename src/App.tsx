import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Assets } from './pages/Assets'
import { AssetDetail } from './pages/AssetDetail'
import { Fehler } from './pages/Fehler'
import { Erklaerung } from './pages/Erklaerung'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="assets" element={<Assets />} />
        <Route path="assets/:id" element={<AssetDetail />} />
        <Route path="fehler" element={<Fehler />} />
        <Route path="erklaerung" element={<Erklaerung />} />
      </Route>
    </Routes>
  )
}

export default App
