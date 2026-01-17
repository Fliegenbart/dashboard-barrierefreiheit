import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Übersicht', icon: '📊' },
  { to: '/assets', label: 'Assets', icon: '📁' },
  { to: '/fehler', label: 'Fehler', icon: '⚠️' },
  { to: '/erklaerung', label: 'Erklärung', icon: '📝' },
]

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip-Link */}
      <a href="#main" className="skip-link">
        Zum Hauptinhalt springen
      </a>

      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span aria-hidden="true">🏛️ </span>
            Barrierefreiheits-Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 rounded hover:bg-primary-dark transition-colors"
              aria-label="Suche"
            >
              🔍
            </button>
            <button
              type="button"
              className="p-2 rounded hover:bg-primary-dark transition-colors"
              aria-label="Einstellungen"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Navigation */}
        <nav
          aria-label="Hauptnavigation"
          className="w-56 bg-white shadow-sm min-h-[calc(100vh-4rem)] p-4"
        >
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Hauptinhalt */}
        <main id="main" className="flex-1 p-6" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          © DRV |{' '}
          <a href="/impressum" className="underline hover:text-primary">
            Impressum
          </a>{' '}
          |{' '}
          <a href="/datenschutz" className="underline hover:text-primary">
            Datenschutz
          </a>{' '}
          |{' '}
          <a href="/barrierefreiheit" className="underline hover:text-primary">
            Barrierefreiheit
          </a>
        </div>
      </footer>
    </div>
  )
}
