import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { storageService } from '../services/storage'
import type { Asset, Issue } from '../types'

const severityLabels: Record<string, { label: string; colorClass: string }> = {
  kritisch: { label: 'Kritisch', colorClass: 'bg-red-100 text-error' },
  schwerwiegend: { label: 'Schwerwiegend', colorClass: 'bg-orange-100 text-warning' },
  geringfuegig: { label: 'Geringfügig', colorClass: 'bg-yellow-100 text-yellow-700' },
}

const statusLabels: Record<string, { label: string; colorClass: string }> = {
  offen: { label: 'Offen', colorClass: 'bg-red-50 text-error' },
  'in-bearbeitung': { label: 'In Bearbeitung', colorClass: 'bg-blue-50 text-blue-700' },
  behoben: { label: 'Behoben', colorClass: 'bg-green-50 text-success' },
  akzeptiert: { label: 'Akzeptiert', colorClass: 'bg-gray-100 text-gray-600' },
}

export function AssetDetail() {
  const { id } = useParams<{ id: string }>()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    if (id) {
      const foundAsset = storageService.getAssetById(id)
      setAsset(foundAsset || null)
      setIssues(storageService.getIssuesByAsset(id))
    }
  }, [id])

  if (!asset) {
    return (
      <div className="space-y-6">
        <Link to="/assets" className="text-primary hover:underline">
          ← Zurück zu Assets
        </Link>
        <p className="text-gray-500">Asset nicht gefunden.</p>
      </div>
    )
  }

  const openIssues = issues.filter((i) => i.status === 'offen' || i.status === 'in-bearbeitung')
  const resolvedIssues = issues.filter((i) => i.status === 'behoben' || i.status === 'akzeptiert')

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link to="/assets" className="text-primary hover:underline">
          ← Zurück zu Assets
        </Link>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{asset.name}</h2>
            <p className="text-gray-500 mt-1">
              {asset.department} • Letzter Scan: {new Date(asset.lastScannedAt).toLocaleDateString('de-DE')}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-4xl font-bold ${
                asset.currentScore >= 80
                  ? 'text-success'
                  : asset.currentScore >= 50
                  ? 'text-warning'
                  : 'text-error'
              }`}
              role="meter"
              aria-valuenow={asset.currentScore}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Score: ${asset.currentScore} Prozent`}
            >
              {asset.currentScore}%
            </div>
            <p className="text-sm text-gray-500">Barrierefreiheits-Score</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Erneut prüfen
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Bericht exportieren
          </button>
        </div>
      </div>

      {/* Zusammenfassung */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <div className="text-3xl font-bold text-error">{openIssues.length}</div>
          <p className="text-gray-600">Offene Probleme</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <div className="text-3xl font-bold text-success">{resolvedIssues.length}</div>
          <p className="text-gray-600">Behoben</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{issues.length}</div>
          <p className="text-gray-600">Gesamt</p>
        </div>
      </div>

      {/* Fehlerliste */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Gefundene Probleme ({issues.length})
        </h3>

        {issues.length > 0 ? (
          <ul className="space-y-4">
            {issues.map((issue) => {
              const severity = severityLabels[issue.severity] || severityLabels.geringfuegig
              const status = statusLabels[issue.status] || statusLabels.offen

              return (
                <li
                  key={issue.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${severity.colorClass}`}>
                          {severity.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.colorClass}`}>
                          {status.label}
                        </span>
                        <span className="text-sm text-primary font-mono">
                          WCAG {issue.wcagCriterion} ({issue.wcagLevel})
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">{issue.title}</h4>
                      <p className="text-gray-600 mt-1">{issue.description}</p>
                      {issue.element && (
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700 overflow-x-auto">
                          <code>{issue.element}</code>
                        </pre>
                      )}
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Empfehlung:</p>
                        <p className="text-sm text-blue-800">{issue.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-4">
            Keine Probleme gefunden.
          </p>
        )}
      </div>
    </div>
  )
}
