const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(error.error || 'Request failed', response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  // Dashboard
  getDashboardStats: () =>
    request<DashboardStats>('/dashboard/stats'),

  getAssetsByType: () =>
    request<AssetsByType[]>('/dashboard/by-type'),

  // Assets
  getAssets: (filters?: AssetFilters) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.sort) params.set('sort', filters.sort);
    if (filters?.order) params.set('order', filters.order);

    const query = params.toString();
    return request<Asset[]>(`/assets${query ? `?${query}` : ''}`);
  },

  getAsset: (id: string) =>
    request<AssetDetail>(`/assets/${id}`),

  createAsset: (data: CreateAssetData) =>
    request<Asset>('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAsset: (id: string, data: Partial<Asset>) =>
    request<Asset>(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteAsset: (id: string) =>
    request<void>(`/assets/${id}`, { method: 'DELETE' }),

  // Issues
  getIssues: (filters?: IssueFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.severity) params.set('severity', filters.severity);
    if (filters?.asset_id) params.set('asset_id', filters.asset_id);

    const query = params.toString();
    return request<Issue[]>(`/issues${query ? `?${query}` : ''}`);
  },

  getIssuesByWcag: () =>
    request<WcagIssueGroup[]>('/issues/by-wcag'),

  updateIssue: (id: string, data: Partial<Issue>) =>
    request<Issue>(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  generateAiSuggestion: (issueId: string) =>
    request<{ suggestion: string }>(`/issues/${issueId}/ai-suggestion`, {
      method: 'POST',
    }),

  // Scans
  scanWebsite: (url: string, name?: string) =>
    request<ScanResponse>('/scans/website', {
      method: 'POST',
      body: JSON.stringify({ url, name }),
    }),

  rescanAsset: (assetId: string) =>
    request<ScanResponse>(`/scans/asset/${assetId}`, {
      method: 'POST',
    }),

  getScans: () =>
    request<ScanHistoryItem[]>('/scans'),
};

// Types
export interface DashboardStats {
  totalAssets: number;
  averageScore: number;
  conformCount: number;
  partialCount: number;
  nonConformCount: number;
  uncheckedCount: number;
  topIssues: { criterion: string; title: string; count: number }[];
  scoreHistory: { date: string; score: number }[];
}

export interface AssetsByType {
  type: string;
  total: number;
  conform: number;
  score: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'confluence' | 'pdf' | 'pptx' | 'website' | 'html';
  url?: string;
  file_path?: string;
  department?: string;
  current_score: number;
  status: 'konform' | 'teilweise' | 'nicht-konform' | 'ungeprueft';
  last_scanned_at?: string;
  created_at: string;
}

export interface AssetDetail extends Asset {
  issues: Issue[];
  scanHistory: ScanResult[];
}

export interface Issue {
  id: string;
  asset_id: string;
  wcag_criterion: string;
  wcag_level: 'A' | 'AA' | 'AAA';
  wcag_principle?: string;
  severity: 'kritisch' | 'schwerwiegend' | 'geringfuegig';
  status: 'offen' | 'in-bearbeitung' | 'behoben' | 'akzeptiert' | 'falsch-positiv';
  title: string;
  description: string;
  element?: string;
  recommendation: string;
  ai_suggestion?: string;
  asset_name?: string;
  asset_type?: string;
}

export interface ScanResult {
  id: string;
  scanned_at: string;
  scan_type: string;
  score: number;
  total_issues: number;
}

export interface WcagIssueGroup {
  wcag_criterion: string;
  wcag_principle: string;
  wcag_level: string;
  count: number;
  open_count: number;
}

export interface AssetFilters {
  type?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IssueFilters {
  status?: string;
  severity?: string;
  asset_id?: string;
}

export interface CreateAssetData {
  name: string;
  type: Asset['type'];
  url?: string;
  department?: string;
  tags?: string[];
}

export interface ScanResponse {
  asset: Asset;
  scan: {
    id: string;
    score: number;
    issueCount: number;
    criticalCount: number;
    majorCount: number;
    minorCount: number;
    duration: number;
  };
  issues: Issue[];
}

export interface ScanHistoryItem {
  id: string;
  asset_id: string;
  scanned_at: string;
  scan_type: string;
  score: number;
  total_issues: number;
  critical_count: number;
  major_count: number;
  minor_count: number;
  asset_name: string;
  asset_type: string;
  asset_url: string;
}

export default api;
