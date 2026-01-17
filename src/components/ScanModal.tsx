import { useState } from 'react'
import { api, type ScanResponse } from '../api/client'

interface ScanModalProps {
  isOpen: boolean
  onClose: () => void
  onScanComplete: (result: ScanResponse) => void
}

export function ScanModal({ isOpen, onClose, onScanComplete }: ScanModalProps) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  if (!isOpen) return null

  const handleScan = async () => {
    if (!url.trim()) {
      setError('Bitte geben Sie eine URL ein.')
      return
    }

    // URL validieren
    try {
      new URL(url)
    } catch {
      setError('Bitte geben Sie eine gültige URL ein (z.B. https://example.com)')
      return
    }

    setScanning(true)
    setError(null)
    setProgress('Starte Scan...')

    try {
      setProgress('Lade Seite und analysiere Barrierefreiheit...')
      const result = await api.scanWebsite(url, name || undefined)

      setProgress('Fertig!')
      onScanComplete(result)

      // Modal schließen und zurücksetzen
      setUrl('')
      setName('')
      setProgress('')
      onClose()
    } catch (err) {
      console.error('Scan failed:', err)
      setError(err instanceof Error ? err.message : 'Scan fehlgeschlagen')
    } finally {
      setScanning(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !scanning) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-modal-title"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
          <h2 id="scan-modal-title" className="text-lg font-semibold">
            Website scannen
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={scanning}
            className="p-1 hover:bg-primary-dark rounded transition-colors disabled:opacity-50"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="scan-url" className="block text-sm font-medium text-gray-700 mb-1">
              URL der Website *
            </label>
            <input
              type="url"
              id="scan-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={scanning}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="scan-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name (optional)
            </label>
            <input
              type="text"
              id="scan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Startseite"
              disabled={scanning}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Wenn leer, wird der Hostname verwendet.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700" role="alert">
              {error}
            </div>
          )}

          {scanning && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-blue-700">{progress}</span>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                Dies kann 10-30 Sekunden dauern...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={scanning}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleScan}
            disabled={scanning || !url.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? 'Scannt...' : 'Scan starten'}
          </button>
        </div>
      </div>
    </div>
  )
}
