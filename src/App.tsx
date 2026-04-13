import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

function HomePage() {
  return <div className="p-4"><h1 className="text-2xl font-bold">PokeFusions</h1></div>
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/select" element={<div>Select</div>} />
        <Route path="/collection" element={<div>Collection</div>} />
        <Route path="/settings" element={<div>Settings</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
