import { useEffect, useState } from 'react'
import { ScoreCard } from '../components/ScoreCard'
import { AssetTypeTable } from '../components/AssetTypeTable'
import { TopIssuesList } from '../components/TopIssuesList'
import { TrendChart } from '../components/TrendChart'
import { api } from '../api/client'
import type { DashboardStats, AssetsByType } from '../api/client'

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [assetsByType, setAssetsByType] = useState<AssetsByType[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, typesData] = await Promise.all([
          api.getDashboardStats(),
          api.getAssetsByType()
        ])
        setStats(statsData)
        setAssetsByType(typesData)
        setError(null)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Backend nicht erreichbar. Starte mit: cd backend && npm install && npm run db:init && npm run dev')
      }
    }
    loadData()
  }, [])

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Backend nicht verbunden</h2>
        <p className="text-yellow-700 mb-4">{error}</p>
        <pre className="bg-yellow-100 p-3 rounded text-sm text-yellow-900 overflow-x-auto">
          cd backend && npm install && npm run db:init && npm run dev
        </pre>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Lade Daten...</p>
      </div>
    )
  }

  const trend = stats.scoreHistory.length >= 2
    ? stats.scoreHistory[stats.scoreHistory.length - 1].score >
      stats.scoreHistory[stats.scoreHistory.length - 2].score
      ? 'up'
      : stats.scoreHistory[stats.scoreHistory.length - 1].score <
        stats.scoreHistory[stats.scoreHistory.length - 2].score
      ? 'down'
      : 'stable'
    : 'stable'

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Übersicht</h2>

      {/* Score-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Gesamt-Score"
          score={stats.averageScore}
          trend={trend as 'up' | 'down' | 'stable'}
          subtitle={`${stats.totalAssets} Assets geprüft`}
        />
        <ScoreCard
          title="Konform"
          score={stats.totalAssets > 0 ? Math.round((stats.conformCount / stats.totalAssets) * 100) : 0}
          subtitle={`${stats.conformCount} von ${stats.totalAssets} Assets`}
        />
        <ScoreCard
          title="Teilweise konform"
          score={stats.totalAssets > 0 ? Math.round((stats.partialCount / stats.totalAssets) * 100) : 0}
          subtitle={`${stats.partialCount} Assets`}
        />
        <ScoreCard
          title="Nicht konform"
          score={100 - (stats.totalAssets > 0 ? Math.round((stats.nonConformCount / stats.totalAssets) * 100) : 0)}
          subtitle={`${stats.nonConformCount} Assets`}
        />
      </div>

      {/* Trendverlauf */}
      <TrendChart data={stats.scoreHistory} />

      {/* Zwei-Spalten-Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetTypeTable data={assetsByType} />
        <TopIssuesList issues={stats.topIssues} />
      </div>
    </div>
  )
}
