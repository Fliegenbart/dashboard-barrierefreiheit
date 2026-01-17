import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { storageService } from '../services/storage'
import type { Asset, AssetType, AssetStatus } from '../types'

const typeLabels: Record<AssetType, string> = {
  confluence: 'Confluence',
  pdf: 'PDF',
  pptx: 'PowerPoint',
  website: 'Webseite',
}

const statusLabels: Record<AssetStatus, { label: string; icon: string; colorClass: string }> = {
  konform: { label: 'Konform', icon: '✓', colorClass: 'text-success bg-green-50' },
  teilweise: { label: 'Teilweise', icon: '⚠', colorClass: 'text-warning bg-orange-50' },
  'nicht-konform': { label: 'Nicht konform', icon: '✗', colorClass: 'text-error bg-red-50' },
  ungeprueft: { label: 'Ungeprüft', icon: '?', colorClass: 'text-gray-500 bg-gray-100' },
}

export function Assets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filterType, setFilterType] = useState<string>('alle')
  const [filterStatus, setFilterStatus] = useState<string>('alle')
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'date'>('name')

  useEffect(() => {
    storageService.initDemoData()
    setAssets(storageService.getAssets())
  }, [])

  // Filtern
  let filteredAssets = assets
  if (filterType !== 'alle') {
    filteredAssets = filteredAssets.filter((a) => a.type === filterType)
  }
  if (filterStatus !== 'alle') {
    filteredAssets = filteredAssets.filter((a) => a.status === filterStatus)
  }

  // Sortieren
  filteredAssets = [...filteredAssets].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'score') return b.currentScore - a.currentScore
    return new Date(b.lastScannedAt).getTime() - new Date(a.lastScannedAt).getTime()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Assets</h2>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          + Neues Asset
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <fieldset>
          <legend className="sr-only">Filter</legend>
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                Typ
              </label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="alle">Alle Typen</option>
                <option value="confluence">Confluence</option>
                <option value="pdf">PDF</option>
                <option value="pptx">PowerPoint</option>
                <option value="website">Webseite</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="alle">Alle Status</option>
                <option value="konform">Konform</option>
                <option value="teilweise">Teilweise</option>
                <option value="nicht-konform">Nicht konform</option>
                <option value="ungeprueft">Ungeprüft</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                Sortierung
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'score' | 'date')}
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="name">Name</option>
                <option value="score">Score</option>
                <option value="date">Letzter Scan</option>
              </select>
            </div>
          </div>
        </fieldset>
      </div>

      {/* Asset-Tabelle */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Name
              </th>
              <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Typ
              </th>
              <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Bereich
              </th>
              <th scope="col" className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                Score
              </th>
              <th scope="col" className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                Status
              </th>
              <th scope="col" className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                Letzter Scan
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => {
              const status = statusLabels[asset.status]
              return (
                <tr key={asset.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link
                      to={`/assets/${asset.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {asset.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {typeLabels[asset.type]}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {asset.department}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-semibold ${
                        asset.currentScore >= 80
                          ? 'text-success'
                          : asset.currentScore >= 50
                          ? 'text-warning'
                          : 'text-error'
                      }`}
                    >
                      {asset.currentScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${status.colorClass}`}
                    >
                      <span aria-hidden="true">{status.icon}</span>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500 text-sm">
                    {new Date(asset.lastScannedAt).toLocaleDateString('de-DE')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredAssets.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Keine Assets gefunden.
          </p>
        )}
      </div>

      <p className="text-sm text-gray-500">
        {filteredAssets.length} von {assets.length} Assets angezeigt
      </p>
    </div>
  )
}
