import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { storageService } from '../services/storage'
import type { Issue, Asset } from '../types'

const wcagPrinciples = [
  {
    id: '1',
    name: 'Wahrnehmbar',
    nameEn: 'Perceivable',
    guidelines: [
      { id: '1.1', name: 'Textalternativen' },
      { id: '1.2', name: 'Zeitbasierte Medien' },
      { id: '1.3', name: 'Anpassbar' },
      { id: '1.4', name: 'Unterscheidbar' },
    ],
  },
  {
    id: '2',
    name: 'Bedienbar',
    nameEn: 'Operable',
    guidelines: [
      { id: '2.1', name: 'Tastaturzugänglich' },
      { id: '2.2', name: 'Ausreichend Zeit' },
      { id: '2.3', name: 'Anfälle vermeiden' },
      { id: '2.4', name: 'Navigierbar' },
      { id: '2.5', name: 'Eingabemodalitäten' },
    ],
  },
  {
    id: '3',
    name: 'Verständlich',
    nameEn: 'Understandable',
    guidelines: [
      { id: '3.1', name: 'Lesbar' },
      { id: '3.2', name: 'Vorhersehbar' },
      { id: '3.3', name: 'Eingabehilfe' },
    ],
  },
  {
    id: '4',
    name: 'Robust',
    nameEn: 'Robust',
    guidelines: [{ id: '4.1', name: 'Kompatibel' }],
  },
]

export function Fehler() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [expandedGuideline, setExpandedGuideline] = useState<string | null>(null)

  useEffect(() => {
    storageService.initDemoData()
    setIssues(storageService.getIssues())
    setAssets(storageService.getAssets())
  }, [])

  const getIssuesByGuideline = (guidelineId: string) => {
    return issues.filter((issue) => issue.wcagCriterion.startsWith(guidelineId))
  }

  const getAssetName = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId)
    return asset?.name || 'Unbekannt'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Fehler-Katalog</h2>
      <p className="text-gray-600">
        Alle gefundenen Barrierefreiheitsfehler, gruppiert nach WCAG-Prinzipien.
      </p>

      {/* Übersicht */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {wcagPrinciples.map((principle) => {
          const principleIssues = issues.filter((i) =>
            i.wcagCriterion.startsWith(principle.id + '.')
          )
          return (
            <div
              key={principle.id}
              className="bg-white rounded-xl shadow-sm border p-4 text-center"
            >
              <div className="text-3xl font-bold text-primary">{principleIssues.length}</div>
              <p className="text-gray-600 text-sm">{principle.name}</p>
            </div>
          )
        })}
      </div>

      {/* Prinzipien */}
      <div className="space-y-4">
        {wcagPrinciples.map((principle) => (
          <div key={principle.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {principle.id}. {principle.name}{' '}
                <span className="text-gray-500 font-normal">({principle.nameEn})</span>
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {principle.guidelines.map((guideline) => {
                const guidelineIssues = getIssuesByGuideline(guideline.id)
                const isExpanded = expandedGuideline === guideline.id

                return (
                  <div key={guideline.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedGuideline(isExpanded ? null : guideline.id)
                      }
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                      aria-expanded={isExpanded}
                    >
                      <span className="font-medium text-gray-900">
                        {guideline.id} {guideline.name}
                      </span>
                      <span className="flex items-center gap-2">
                        {guidelineIssues.length > 0 && (
                          <span className="px-2 py-0.5 bg-error text-white rounded-full text-sm">
                            {guidelineIssues.length}
                          </span>
                        )}
                        <span aria-hidden="true">{isExpanded ? '▼' : '▶'}</span>
                      </span>
                    </button>

                    {isExpanded && guidelineIssues.length > 0 && (
                      <div className="px-4 pb-4">
                        <ul className="space-y-2">
                          {guidelineIssues.map((issue) => (
                            <li
                              key={issue.id}
                              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <span
                                className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
                                  issue.severity === 'kritisch'
                                    ? 'bg-red-100 text-error'
                                    : issue.severity === 'schwerwiegend'
                                    ? 'bg-orange-100 text-warning'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {issue.wcagCriterion}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{issue.title}</p>
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {issue.description}
                                </p>
                                <Link
                                  to={`/assets/${issue.assetId}`}
                                  className="text-sm text-primary hover:underline mt-1 inline-block"
                                >
                                  → {getAssetName(issue.assetId)}
                                </Link>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {isExpanded && guidelineIssues.length === 0 && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-500 text-sm">
                          Keine Fehler in dieser Kategorie gefunden.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
