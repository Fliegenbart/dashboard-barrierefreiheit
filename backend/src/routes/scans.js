import { Router } from 'express';
import db, { generateId } from '../db/index.js';
import { scanWebsite } from '../services/html-scanner.js';

const router = Router();

// POST /api/scans/website - Website scannen
router.post('/website', async (req, res) => {
  const orgId = req.user.organizationId;
  const { url, name } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // URL validieren
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    console.log(`Starting scan for ${url}...`);

    // Scan durchführen
    const result = await scanWebsite(url);

    if (!result.success) {
      return res.status(500).json({
        error: 'Scan failed',
        details: result.error
      });
    }

    // Asset erstellen oder finden
    let asset = db.prepare(`
      SELECT * FROM assets WHERE organization_id = ? AND url = ? AND deleted_at IS NULL
    `).get(orgId, url);

    const assetId = asset?.id || generateId();

    if (!asset) {
      // Neues Asset erstellen
      db.prepare(`
        INSERT INTO assets (id, organization_id, name, type, url, current_score, status, last_scanned_at)
        VALUES (?, ?, ?, 'website', ?, ?, ?, datetime('now'))
      `).run(
        assetId,
        orgId,
        name || new URL(url).hostname,
        url,
        result.score,
        result.score >= 80 ? 'konform' : result.score >= 50 ? 'teilweise' : 'nicht-konform'
      );
    } else {
      // Asset aktualisieren
      db.prepare(`
        UPDATE assets
        SET current_score = ?, status = ?, last_scanned_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).run(
        result.score,
        result.score >= 80 ? 'konform' : result.score >= 50 ? 'teilweise' : 'nicht-konform',
        assetId
      );
    }

    // Scan-Ergebnis speichern
    const scanId = generateId();
    const criticalCount = result.issues.filter(i => i.severity === 'kritisch').length;
    const majorCount = result.issues.filter(i => i.severity === 'schwerwiegend').length;
    const minorCount = result.issues.filter(i => i.severity === 'geringfuegig').length;

    db.prepare(`
      INSERT INTO scan_results (id, asset_id, scan_type, scanner_version, score, total_issues, critical_count, major_count, minor_count, raw_output, duration_ms)
      VALUES (?, ?, 'automatisch', 'axe-core + custom', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      scanId,
      assetId,
      result.score,
      result.issues.length,
      criticalCount,
      majorCount,
      minorCount,
      JSON.stringify(result.metadata),
      result.metadata.duration
    );

    // Issues speichern
    const insertIssue = db.prepare(`
      INSERT INTO issues (id, scan_result_id, asset_id, wcag_criterion, wcag_level, wcag_principle, severity, title, description, element, selector, page_url, recommendation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const issue of result.issues) {
      insertIssue.run(
        generateId(),
        scanId,
        assetId,
        issue.wcag_criterion,
        issue.wcag_level,
        issue.wcag_principle,
        issue.severity,
        issue.title,
        issue.description,
        issue.element || null,
        issue.selector || null,
        issue.page_url || url,
        issue.recommendation
      );
    }

    // Asset mit Issues zurückgeben
    const savedAsset = db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId);
    const savedIssues = db.prepare('SELECT * FROM issues WHERE scan_result_id = ?').all(scanId);

    res.json({
      asset: savedAsset,
      scan: {
        id: scanId,
        score: result.score,
        issueCount: result.issues.length,
        criticalCount,
        majorCount,
        minorCount,
        duration: result.metadata.duration,
      },
      issues: savedIssues,
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Scan failed', details: error.message });
  }
});

// POST /api/scans/asset/:id - Bestehendes Asset erneut scannen
router.post('/asset/:id', async (req, res) => {
  const { id } = req.params;

  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);

  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  if (!asset.url) {
    return res.status(400).json({ error: 'Asset has no URL to scan' });
  }

  if (asset.type !== 'website' && asset.type !== 'html') {
    return res.status(400).json({ error: 'Only website/html assets can be scanned with this endpoint' });
  }

  try {
    const result = await scanWebsite(asset.url);

    if (!result.success) {
      return res.status(500).json({ error: 'Scan failed', details: result.error });
    }

    // Asset aktualisieren
    db.prepare(`
      UPDATE assets
      SET current_score = ?, status = ?, last_scanned_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(
      result.score,
      result.score >= 80 ? 'konform' : result.score >= 50 ? 'teilweise' : 'nicht-konform',
      id
    );

    // Scan-Ergebnis speichern
    const scanId = generateId();
    const criticalCount = result.issues.filter(i => i.severity === 'kritisch').length;
    const majorCount = result.issues.filter(i => i.severity === 'schwerwiegend').length;
    const minorCount = result.issues.filter(i => i.severity === 'geringfuegig').length;

    db.prepare(`
      INSERT INTO scan_results (id, asset_id, scan_type, scanner_version, score, total_issues, critical_count, major_count, minor_count, raw_output, duration_ms)
      VALUES (?, ?, 'automatisch', 'axe-core + custom', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      scanId,
      id,
      result.score,
      result.issues.length,
      criticalCount,
      majorCount,
      minorCount,
      JSON.stringify(result.metadata),
      result.metadata.duration
    );

    // Alte offene Issues auf "falsch-positiv" setzen (optional)
    // db.prepare(`UPDATE issues SET status = 'falsch-positiv' WHERE asset_id = ? AND status = 'offen'`).run(id);

    // Neue Issues speichern
    const insertIssue = db.prepare(`
      INSERT INTO issues (id, scan_result_id, asset_id, wcag_criterion, wcag_level, wcag_principle, severity, title, description, element, selector, page_url, recommendation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const issue of result.issues) {
      insertIssue.run(
        generateId(),
        scanId,
        id,
        issue.wcag_criterion,
        issue.wcag_level,
        issue.wcag_principle,
        issue.severity,
        issue.title,
        issue.description,
        issue.element || null,
        issue.selector || null,
        issue.page_url || asset.url,
        issue.recommendation
      );
    }

    const savedAsset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
    const savedIssues = db.prepare('SELECT * FROM issues WHERE scan_result_id = ?').all(scanId);

    res.json({
      asset: savedAsset,
      scan: {
        id: scanId,
        score: result.score,
        issueCount: result.issues.length,
        criticalCount,
        majorCount,
        minorCount,
        duration: result.metadata.duration,
      },
      issues: savedIssues,
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Scan failed', details: error.message });
  }
});

// GET /api/scans - Liste der Scans
router.get('/', (req, res) => {
  const orgId = req.user.organizationId;

  const scans = db.prepare(`
    SELECT
      s.*,
      a.name as asset_name,
      a.type as asset_type,
      a.url as asset_url
    FROM scan_results s
    JOIN assets a ON s.asset_id = a.id
    WHERE a.organization_id = ?
    ORDER BY s.scanned_at DESC
    LIMIT 50
  `).all(orgId);

  res.json(scans);
});

export default router;
