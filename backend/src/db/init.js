import db, { initDatabase, generateId } from './index.js';

// Initialize database
initDatabase();

// Check if demo data exists
const orgCount = db.prepare('SELECT COUNT(*) as count FROM organizations').get();

if (orgCount.count === 0) {
  console.log('Creating demo data...');

  // Create demo organization
  const orgId = generateId();
  db.prepare(`
    INSERT INTO organizations (id, name, slug)
    VALUES (?, ?, ?)
  `).run(orgId, 'Demo Organisation', 'demo');

  // Create demo user
  const userId = generateId();
  db.prepare(`
    INSERT INTO users (id, organization_id, email, display_name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, orgId, 'admin@demo.de', 'Admin User', 'admin');

  // Create demo assets
  const assets = [
    {
      id: generateId(),
      name: 'Startseite Intranet',
      type: 'confluence',
      url: 'https://confluence.example.de/pages/start',
      department: 'Kommunikation',
      score: 85,
      status: 'teilweise'
    },
    {
      id: generateId(),
      name: 'Leitfaden Barrierefreiheit.pdf',
      type: 'pdf',
      file_path: '/docs/leitfaden.pdf',
      department: 'IT',
      score: 92,
      status: 'konform'
    },
    {
      id: generateId(),
      name: 'Jahresbericht 2024.pdf',
      type: 'pdf',
      file_path: '/docs/jahresbericht.pdf',
      department: 'Finanzen',
      score: 45,
      status: 'nicht-konform'
    },
    {
      id: generateId(),
      name: 'Onboarding Präsentation',
      type: 'pptx',
      file_path: '/presentations/onboarding.pptx',
      department: 'Personal',
      score: 68,
      status: 'teilweise'
    },
    {
      id: generateId(),
      name: 'Formulare und Anträge',
      type: 'confluence',
      url: 'https://confluence.example.de/pages/formulare',
      department: 'Verwaltung',
      score: 78,
      status: 'teilweise'
    }
  ];

  const insertAsset = db.prepare(`
    INSERT INTO assets (id, organization_id, name, type, url, file_path, department, current_score, status, last_scanned_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (const asset of assets) {
    insertAsset.run(
      asset.id,
      orgId,
      asset.name,
      asset.type,
      asset.url || null,
      asset.file_path || null,
      asset.department,
      asset.score,
      asset.status
    );
  }

  // Create demo scan results and issues
  const scanId = generateId();
  db.prepare(`
    INSERT INTO scan_results (id, asset_id, scan_type, score, total_issues, critical_count, major_count)
    VALUES (?, ?, 'automatisch', 85, 2, 1, 1)
  `).run(scanId, assets[0].id);

  const issues = [
    {
      asset_id: assets[0].id,
      scan_result_id: scanId,
      wcag_criterion: '1.1.1',
      wcag_level: 'A',
      wcag_principle: 'Wahrnehmbar',
      severity: 'kritisch',
      title: 'Bilder ohne Alternativtext',
      description: '3 Bilder auf der Startseite haben keinen alt-Text.',
      element: '<img src="hero.jpg">',
      recommendation: 'Fügen Sie aussagekräftige alt-Attribute hinzu.'
    },
    {
      asset_id: assets[0].id,
      scan_result_id: scanId,
      wcag_criterion: '2.4.4',
      wcag_level: 'A',
      wcag_principle: 'Bedienbar',
      severity: 'schwerwiegend',
      title: 'Unklare Link-Texte',
      description: 'Links mit Text "hier klicken" sind nicht aussagekräftig.',
      recommendation: 'Verwenden Sie beschreibende Link-Texte.'
    },
    {
      asset_id: assets[2].id,
      scan_result_id: scanId,
      wcag_criterion: '1.4.3',
      wcag_level: 'AA',
      wcag_principle: 'Wahrnehmbar',
      severity: 'kritisch',
      title: 'Unzureichender Farbkontrast',
      description: 'Text auf farbigem Hintergrund hat zu geringen Kontrast.',
      recommendation: 'Erhöhen Sie den Kontrast auf mindestens 4.5:1.'
    },
    {
      asset_id: assets[2].id,
      scan_result_id: scanId,
      wcag_criterion: '1.3.1',
      wcag_level: 'A',
      wcag_principle: 'Wahrnehmbar',
      severity: 'kritisch',
      title: 'Fehlende Dokumentstruktur',
      description: 'PDF hat keine Tags für Überschriften und Listen.',
      recommendation: 'Taggen Sie das PDF mit korrekter Struktur.'
    },
    {
      asset_id: assets[3].id,
      scan_result_id: scanId,
      wcag_criterion: '1.1.1',
      wcag_level: 'A',
      wcag_principle: 'Wahrnehmbar',
      severity: 'schwerwiegend',
      title: 'Diagramme ohne Beschreibung',
      description: 'Komplexe Diagramme haben keine Textalternative.',
      recommendation: 'Fügen Sie beschreibende Texte zu Diagrammen hinzu.',
      status: 'in-bearbeitung'
    }
  ];

  const insertIssue = db.prepare(`
    INSERT INTO issues (id, scan_result_id, asset_id, wcag_criterion, wcag_level, wcag_principle, severity, title, description, element, recommendation, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const issue of issues) {
    insertIssue.run(
      generateId(),
      issue.scan_result_id,
      issue.asset_id,
      issue.wcag_criterion,
      issue.wcag_level,
      issue.wcag_principle,
      issue.severity,
      issue.title,
      issue.description,
      issue.element || null,
      issue.recommendation,
      issue.status || 'offen'
    );
  }

  // Create score history
  const insertHistory = db.prepare(`
    INSERT INTO score_history (id, organization_id, date, average_score, total_assets, conform_count, partial_count, non_conform_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const dateStr = date.toISOString().split('T')[0];
    const score = Math.round(55 + (11 - i) * 2.5 + Math.random() * 5);

    insertHistory.run(
      generateId(),
      orgId,
      dateStr,
      score,
      5,
      1,
      3,
      1
    );
  }

  console.log('Demo data created!');
} else {
  console.log('Database already contains data, skipping demo data creation.');
}

console.log('Database ready!');
