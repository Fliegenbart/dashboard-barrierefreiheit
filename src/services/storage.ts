import type { Asset, Issue, DashboardStats, AssetsByType } from '../types'

const STORAGE_KEYS = {
  ASSETS: 'a11y_assets',
  ISSUES: 'a11y_issues',
  SCORE_HISTORY: 'a11y_score_history',
}

// Demo-Daten für den Start
const createDemoData = (): { assets: Asset[]; issues: Issue[] } => {
  const now = new Date().toISOString()
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const assets: Asset[] = [
    {
      id: '1',
      name: 'Startseite Intranet',
      type: 'confluence',
      url: 'https://confluence.drv.de/pages/start',
      department: 'Kommunikation',
      space: 'INTRANET',
      createdAt: lastMonth,
      lastScannedAt: now,
      currentScore: 85,
      status: 'teilweise',
    },
    {
      id: '2',
      name: 'Leitfaden Barrierefreiheit.pdf',
      type: 'pdf',
      filePath: '/docs/leitfaden.pdf',
      department: 'IT',
      createdAt: lastMonth,
      lastScannedAt: now,
      currentScore: 92,
      status: 'konform',
    },
    {
      id: '3',
      name: 'Jahresbericht 2024.pdf',
      type: 'pdf',
      filePath: '/docs/jahresbericht.pdf',
      department: 'Finanzen',
      createdAt: lastMonth,
      lastScannedAt: now,
      currentScore: 45,
      status: 'nicht-konform',
    },
    {
      id: '4',
      name: 'Onboarding Präsentation',
      type: 'pptx',
      filePath: '/presentations/onboarding.pptx',
      department: 'Personal',
      createdAt: lastMonth,
      lastScannedAt: now,
      currentScore: 68,
      status: 'teilweise',
    },
    {
      id: '5',
      name: 'Formulare und Anträge',
      type: 'confluence',
      url: 'https://confluence.drv.de/pages/formulare',
      department: 'Verwaltung',
      space: 'FORMULARE',
      createdAt: lastMonth,
      lastScannedAt: now,
      currentScore: 78,
      status: 'teilweise',
    },
  ]

  const issues: Issue[] = [
    {
      id: 'i1',
      assetId: '1',
      wcagCriterion: '1.1.1',
      wcagLevel: 'A',
      severity: 'kritisch',
      title: 'Bilder ohne Alternativtext',
      description: '3 Bilder auf der Startseite haben keinen alt-Text.',
      element: '<img src="hero.jpg">',
      recommendation: 'Fügen Sie aussagekräftige alt-Attribute hinzu.',
      status: 'offen',
    },
    {
      id: 'i2',
      assetId: '1',
      wcagCriterion: '2.4.4',
      wcagLevel: 'A',
      severity: 'schwerwiegend',
      title: 'Unklare Link-Texte',
      description: 'Links mit Text "hier klicken" sind nicht aussagekräftig.',
      recommendation: 'Verwenden Sie beschreibende Link-Texte.',
      status: 'offen',
    },
    {
      id: 'i3',
      assetId: '3',
      wcagCriterion: '1.4.3',
      wcagLevel: 'AA',
      severity: 'kritisch',
      title: 'Unzureichender Farbkontrast',
      description: 'Text auf farbigem Hintergrund hat zu geringen Kontrast.',
      recommendation: 'Erhöhen Sie den Kontrast auf mindestens 4.5:1.',
      status: 'offen',
    },
    {
      id: 'i4',
      assetId: '3',
      wcagCriterion: '1.3.1',
      wcagLevel: 'A',
      severity: 'kritisch',
      title: 'Fehlende Dokumentstruktur',
      description: 'PDF hat keine Tags für Überschriften und Listen.',
      recommendation: 'Taggen Sie das PDF mit korrekter Struktur.',
      status: 'offen',
    },
    {
      id: 'i5',
      assetId: '4',
      wcagCriterion: '1.1.1',
      wcagLevel: 'A',
      severity: 'schwerwiegend',
      title: 'Diagramme ohne Beschreibung',
      description: 'Komplexe Diagramme haben keine Textalternative.',
      recommendation: 'Fügen Sie beschreibende Texte zu Diagrammen hinzu.',
      status: 'in-bearbeitung',
    },
  ]

  return { assets, issues }
}

export const storageService = {
  initDemoData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.ASSETS)) {
      const { assets, issues } = createDemoData()
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets))
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues))

      // Score-Historie generieren
      const history = []
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        history.push({
          date: date.toISOString().split('T')[0],
          score: Math.round(55 + i * 2.5 + Math.random() * 5),
        })
      }
      localStorage.setItem(STORAGE_KEYS.SCORE_HISTORY, JSON.stringify(history))
    }
  },

  getAssets(): Asset[] {
    const data = localStorage.getItem(STORAGE_KEYS.ASSETS)
    return data ? JSON.parse(data) : []
  },

  getAssetById(id: string): Asset | undefined {
    return this.getAssets().find((a) => a.id === id)
  },

  saveAsset(asset: Asset): void {
    const assets = this.getAssets()
    const index = assets.findIndex((a) => a.id === asset.id)
    if (index >= 0) {
      assets[index] = asset
    } else {
      assets.push(asset)
    }
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets))
  },

  deleteAsset(id: string): void {
    const assets = this.getAssets().filter((a) => a.id !== id)
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets))
    // Auch zugehörige Issues löschen
    const issues = this.getIssues().filter((i) => i.assetId !== id)
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues))
  },

  getIssues(): Issue[] {
    const data = localStorage.getItem(STORAGE_KEYS.ISSUES)
    return data ? JSON.parse(data) : []
  },

  getIssuesByAsset(assetId: string): Issue[] {
    return this.getIssues().filter((i) => i.assetId === assetId)
  },

  getScoreHistory(): { date: string; score: number }[] {
    const data = localStorage.getItem(STORAGE_KEYS.SCORE_HISTORY)
    return data ? JSON.parse(data) : []
  },

  getDashboardStats(): DashboardStats {
    const assets = this.getAssets()
    const issues = this.getIssues()
    const history = this.getScoreHistory()

    const totalAssets = assets.length
    const averageScore = totalAssets > 0
      ? Math.round(assets.reduce((sum, a) => sum + a.currentScore, 0) / totalAssets)
      : 0

    const conformCount = assets.filter((a) => a.status === 'konform').length
    const partialCount = assets.filter((a) => a.status === 'teilweise').length
    const nonConformCount = assets.filter((a) => a.status === 'nicht-konform').length
    const uncheckedCount = assets.filter((a) => a.status === 'ungeprueft').length

    // Top-Fehler gruppieren
    const issueCounts: Record<string, { count: number; title: string }> = {}
    issues.forEach((issue) => {
      if (!issueCounts[issue.wcagCriterion]) {
        issueCounts[issue.wcagCriterion] = { count: 0, title: issue.title }
      }
      issueCounts[issue.wcagCriterion].count++
    })

    const topIssues = Object.entries(issueCounts)
      .map(([criterion, data]) => ({ criterion, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalAssets,
      averageScore,
      conformCount,
      partialCount,
      nonConformCount,
      uncheckedCount,
      topIssues,
      scoreHistory: history,
    }
  },

  getAssetsByType(): AssetsByType[] {
    const assets = this.getAssets()
    const types: AssetType[] = ['confluence', 'pdf', 'pptx', 'website']

    return types.map((type) => {
      const typeAssets = assets.filter((a) => a.type === type)
      const total = typeAssets.length
      const conform = typeAssets.filter((a) => a.status === 'konform').length
      const score = total > 0
        ? Math.round(typeAssets.reduce((sum, a) => sum + a.currentScore, 0) / total)
        : 0

      return { type, total, conform, score }
    }).filter((t) => t.total > 0)
  },
}

type AssetType = Asset['type']
