-- Barrierefreiheits-Dashboard Schema

-- Organisationen (Multi-Tenant)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Benutzer
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    password_hash TEXT,
    display_name TEXT NOT NULL,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'editor', 'viewer')),
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(organization_id, email)
);

-- Assets (Dokumente, Webseiten)
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('confluence', 'pdf', 'pptx', 'website', 'html')),
    url TEXT,
    file_path TEXT,
    original_filename TEXT,
    file_size_bytes INTEGER,
    department TEXT,
    tags TEXT DEFAULT '[]',
    current_score INTEGER CHECK (current_score >= 0 AND current_score <= 100),
    status TEXT DEFAULT 'ungeprueft' CHECK (status IN ('konform', 'teilweise', 'nicht-konform', 'ungeprueft')),
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_scanned_at TEXT,
    deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_assets_org ON assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

-- Scan-Ergebnisse
CREATE TABLE IF NOT EXISTS scan_results (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    scanned_at TEXT DEFAULT (datetime('now')),
    scan_type TEXT NOT NULL CHECK (scan_type IN ('automatisch', 'manuell', 'kombiniert')),
    scanner_version TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    total_issues INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    major_count INTEGER DEFAULT 0,
    minor_count INTEGER DEFAULT 0,
    raw_output TEXT,
    triggered_by TEXT REFERENCES users(id),
    duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_scans_asset ON scan_results(asset_id);
CREATE INDEX IF NOT EXISTS idx_scans_date ON scan_results(scanned_at);

-- Fehler/Issues
CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    scan_result_id TEXT NOT NULL REFERENCES scan_results(id) ON DELETE CASCADE,
    asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    wcag_criterion TEXT NOT NULL,
    wcag_level TEXT NOT NULL CHECK (wcag_level IN ('A', 'AA', 'AAA')),
    wcag_principle TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('kritisch', 'schwerwiegend', 'geringfuegig')),
    status TEXT DEFAULT 'offen' CHECK (status IN ('offen', 'in-bearbeitung', 'behoben', 'akzeptiert', 'falsch-positiv')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    element TEXT,
    selector TEXT,
    page_url TEXT,
    recommendation TEXT NOT NULL,
    ai_suggestion TEXT,
    ai_suggestion_generated_at TEXT,
    assigned_to TEXT REFERENCES users(id),
    assigned_at TEXT,
    resolved_at TEXT,
    resolved_by TEXT REFERENCES users(id),
    resolution_notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_issues_asset ON issues(asset_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_wcag ON issues(wcag_criterion);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(severity);

-- Score-Historie (für Trendverlauf)
CREATE TABLE IF NOT EXISTS score_history (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    average_score INTEGER,
    total_assets INTEGER,
    conform_count INTEGER,
    partial_count INTEGER,
    non_conform_count INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(organization_id, date)
);

-- Audit-Log (DSGVO)
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(created_at);
