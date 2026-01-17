import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, type AssetDetail as AssetDetailType, type Issue } from '../api/client'

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
  'falsch-positiv': { label: 'Falsch-Positiv', colorClass: 'bg-gray-100 text-gray-600' },
}

export function AssetDetail() {
  const { id } = useParams<{ id: string }>()
  const [asset, setAsset] = useState<AssetDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [generatingAI, setGeneratingAI] = useState<string | null>(null)

  const loadAsset = async () => {
    if (!id) return
    try {
      const data = await api.getAsset(id)
      setAsset(data)
    } catch (err) {
      console.error('Failed to load asset:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAsset()
  }, [id])

  const handleRescan = async () => {
    if (!id || !asset?.url) return
    setScanning(true)
    try {
      await api.rescanAsset(id)
      await loadAsset()
    } catch (err) {
      console.error('Rescan failed:', err)
    } finally {
      setScanning(false)
    }
  }

  const handleGenerateAI = async (issueId: string) => {
    setGeneratingAI(issueId)
    try {
      const result = await api.generateAiSuggestion(issueId)
      // Update issue in state
      if (asset) {
        setAsset({
          ...asset,
          issues: asset.issues.map(issue =>
            issue.id === issueId
              ? { ...issue, ai_suggestion: result.suggestion }
              : issue
          )
        })
      }
    } catch (err) {
      console.error('AI generation failed:', err)
      alert('KI-Empfehlung konnte nicht generiert werden. Ist Ollama gestartet?')
    } finally {
      setGeneratingAI(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Lade Asset...</p>
      </div>
    )
  }

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

  const openIssues = asset.issues.filter((i) => i.status === 'offen' || i.status === 'in-bearbeitung')
  const resolvedIssues = asset.issues.filter((i) => i.status === 'behoben' || i.status === 'akzeptiert')

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
              {asset.department && `${asset.department} • `}
              {asset.url && (
                <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {asset.url}
                </a>
              )}
            </p>
            {asset.last_scanned_at && (
              <p className="text-gray-400 text-sm mt-1">
                Letzter Scan: {new Date(asset.last_scanned_at).toLocaleString('de-DE')}
              </p>
            )}
          </div>
          <div className="text-right">
            <div
              className={`text-4xl font-bold ${
                asset.current_score >= 80
                  ? 'text-success'
                  : asset.current_score >= 50
                  ? 'text-warning'
                  : 'text-error'
              }`}
              role="meter"
              aria-valuenow={asset.current_score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Score: ${asset.current_score} Prozent`}
            >
              {asset.current_score}%
            </div>
            <p className="text-sm text-gray-500">Barrierefreiheits-Score</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {asset.url && (
            <button
              type="button"
              onClick={handleRescan}
              disabled={scanning}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {scanning ? 'Scannt...' : 'Erneut prüfen'}
            </button>
          )}
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
          <div className="text-3xl font-bold text-gray-900">{asset.issues.length}</div>
          <p className="text-gray-600">Gesamt</p>
        </div>
      </div>

      {/* Fehlerliste */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Gefundene Probleme ({asset.issues.length})
        </h3>

        {asset.issues.length > 0 ? (
          <ul className="space-y-4">
            {asset.issues.map((issue) => {
              const severity = severityLabels[issue.severity] || severityLabels.geringfuegig
              const status = statusLabels[issue.status] || statusLabels.offen
              const isGenerating = generatingAI === issue.id

              return (
                <li
                  key={issue.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${severity.colorClass}`}>
                          {severity.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.colorClass}`}>
                          {status.label}
                        </span>
                        <span className="text-sm text-primary font-mono">
                          WCAG {issue.wcag_criterion} ({issue.wcag_level})
                        </span>
                        {issue.wcag_principle && (
                          <span className="text-xs text-gray-500">
                            {issue.wcag_principle}
                          </span>
                        )}
                      </div>

                      <h4 className="font-medium text-gray-900">{issue.title}</h4>
                      <p className="text-gray-600 mt-1">{issue.description}</p>

                      {issue.element && (
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700 overflow-x-auto">
                          <code>{issue.element}</code>
                        </pre>
                      )}

                      {/* Standard-Empfehlung */}
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Empfehlung:</p>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{issue.recommendation}</p>
                      </div>

                      {/* KI-Empfehlung */}
                      {issue.ai_suggestion ? (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm font-medium text-purple-900 flex items-center gap-2">
                            <span>🤖</span> KI-Empfehlung:
                          </p>
                          <p className="text-sm text-purple-800 whitespace-pre-wrap mt-1">
                            {issue.ai_suggestion}
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGenerateAI(issue.id)}
                          disabled={isGenerating}
                          className="mt-3 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              Generiere KI-Empfehlung...
                            </>
                          ) : (
                            <>
                              <span>🤖</span>
                              KI-Empfehlung generieren
                            </>
                          )}
                        </button>
                      )}
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
