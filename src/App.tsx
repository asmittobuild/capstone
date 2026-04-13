import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { FusionProvider } from './context/FusionContext'
import { HomePage } from './pages/HomePage'
import { SelectPage } from './pages/SelectPage'
import { CollectionPage } from './pages/CollectionPage'
import { SettingsPage } from './pages/SettingsPage'

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <NavLink to="/" className="text-lg font-bold text-gray-900 dark:text-white">
          PokeFusions
        </NavLink>

        {/* Desktop */}
        <div className="hidden sm:flex gap-1">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/select" className={linkClass}>Select</NavLink>
          <NavLink to="/collection" className={linkClass}>Collection</NavLink>
          <NavLink to="/settings" className={linkClass}>Settings</NavLink>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 text-gray-700 dark:text-gray-300"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 pb-2 px-4 space-y-1">
          <NavLink to="/" className={linkClass} end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/select" className={linkClass} onClick={() => setMenuOpen(false)}>Select</NavLink>
          <NavLink to="/collection" className={linkClass} onClick={() => setMenuOpen(false)}>Collection</NavLink>
          <NavLink to="/settings" className={linkClass} onClick={() => setMenuOpen(false)}>Settings</NavLink>
        </div>
      )}
    </nav>
  )
}

function App() {
  return (
    <HashRouter>
      <FusionProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
          <NavBar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/select" element={<SelectPage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </FusionProvider>
    </HashRouter>
  )
}

export default App
