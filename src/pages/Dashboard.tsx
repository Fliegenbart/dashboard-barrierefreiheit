import { useEffect, useState } from 'react'
import { ScoreCard } from '../components/ScoreCard'
import { AssetTypeTable } from '../components/AssetTypeTable'
import { TopIssuesList } from '../components/TopIssuesList'
import { TrendChart } from '../components/TrendChart'
import { storageService } from '../services/storage'
import type { DashboardStats, AssetsByType } from '../types'

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [assetsByType, setAssetsByType] = useState<AssetsByType[]>([])

  useEffect(() => {
    storageService.initDemoData()
    setStats(storageService.getDashboardStats())
    setAssetsByType(storageService.getAssetsByType())
  }, [])

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
