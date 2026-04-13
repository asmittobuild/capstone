import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FusionProvider } from './context/FusionContext'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <HashRouter>
      <FusionProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select" element={<div>Select</div>} />
          <Route path="/collection" element={<div>Collection</div>} />
          <Route path="/settings" element={<div>Settings</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FusionProvider>
    </HashRouter>
  )
}

export default App
