export type AssetType = 'confluence' | 'pdf' | 'pptx' | 'website'
export type AssetStatus = 'konform' | 'teilweise' | 'nicht-konform' | 'ungeprueft'
export type Severity = 'kritisch' | 'schwerwiegend' | 'geringfuegig'
export type IssueStatus = 'offen' | 'in-bearbeitung' | 'behoben' | 'akzeptiert'
export type WcagLevel = 'A' | 'AA' | 'AAA'

export interface Asset {
  id: string
  name: string
  type: AssetType
  url?: string
  filePath?: string
  department: string
  space?: string
  createdAt: string
  lastScannedAt: string
  currentScore: number
  status: AssetStatus
}

export interface Issue {
  id: string
  assetId: string
  wcagCriterion: string
  wcagLevel: WcagLevel
  severity: Severity
  title: string
  description: string
  element?: string
  recommendation: string
  status: IssueStatus
}

export interface ScanResult {
  id: string
  assetId: string
  scannedAt: string
  score: number
  issues: Issue[]
  scanType: 'automatisch' | 'manuell' | 'kombiniert'
}

export interface DashboardStats {
  totalAssets: number
  averageScore: number
  conformCount: number
  partialCount: number
  nonConformCount: number
  uncheckedCount: number
  topIssues: { criterion: string; count: number; title: string }[]
  scoreHistory: { date: string; score: number }[]
}

export interface AssetsByType {
  type: AssetType
  total: number
  conform: number
  score: number
}
