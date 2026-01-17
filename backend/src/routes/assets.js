import { Router } from 'express';
import db, { generateId } from '../db/index.js';

const router = Router();

// GET /api/assets - Liste aller Assets
router.get('/', (req, res) => {
  const orgId = req.user.organizationId;
  const { type, status, department, sort = 'name', order = 'asc' } = req.query;

  let query = `
    SELECT
      id, name, type, url, file_path, department,
      current_score, status, last_scanned_at, created_at
    FROM assets
    WHERE organization_id = ? AND deleted_at IS NULL
  `;
  const params = [orgId];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (department) {
    query += ' AND department = ?';
    params.push(department);
  }

  // Sortierung
  const validSorts = ['name', 'current_score', 'last_scanned_at', 'created_at'];
  const sortColumn = validSorts.includes(sort) ? sort : 'name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;

  const assets = db.prepare(query).all(...params);
  res.json(assets);
});

// GET /api/assets/:id - Einzelnes Asset
router.get('/:id', (req, res) => {
  const orgId = req.user.organizationId;
  const { id } = req.params;

  const asset = db.prepare(`
    SELECT * FROM assets
    WHERE id = ? AND organization_id = ? AND deleted_at IS NULL
  `).get(id, orgId);

  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  // Issues laden
  const issues = db.prepare(`
    SELECT * FROM issues
    WHERE asset_id = ?
    ORDER BY
      CASE severity
        WHEN 'kritisch' THEN 1
        WHEN 'schwerwiegend' THEN 2
        ELSE 3
      END,
      created_at DESC
  `).all(id);

  // Scan-Historie
  const scanHistory = db.prepare(`
    SELECT id, scanned_at, scan_type, score, total_issues
    FROM scan_results
    WHERE asset_id = ?
    ORDER BY scanned_at DESC
    LIMIT 10
  `).all(id);

  res.json({
    ...asset,
    issues,
    scanHistory
  });
});

// POST /api/assets - Neues Asset erstellen
router.post('/', (req, res) => {
  const orgId = req.user.organizationId;
  const { name, type, url, department, tags } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  const id = generateId();

  db.prepare(`
    INSERT INTO assets (id, organization_id, name, type, url, department, tags, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ungeprueft')
  `).run(id, orgId, name, type, url || null, department || null, JSON.stringify(tags || []));

  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  res.status(201).json(asset);
});

// PATCH /api/assets/:id - Asset aktualisieren
router.patch('/:id', (req, res) => {
  const orgId = req.user.organizationId;
  const { id } = req.params;
  const { name, department, tags, status } = req.body;

  const existing = db.prepare(`
    SELECT * FROM assets WHERE id = ? AND organization_id = ?
  `).get(id, orgId);

  if (!existing) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  db.prepare(`
    UPDATE assets
    SET
      name = COALESCE(?, name),
      department = COALESCE(?, department),
      tags = COALESCE(?, tags),
      status = COALESCE(?, status),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(name, department, tags ? JSON.stringify(tags) : null, status, id);

  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  res.json(asset);
});

// DELETE /api/assets/:id - Asset löschen (soft delete)
router.delete('/:id', (req, res) => {
  const orgId = req.user.organizationId;
  const { id } = req.params;

  const result = db.prepare(`
    UPDATE assets
    SET deleted_at = datetime('now')
    WHERE id = ? AND organization_id = ?
  `).run(id, orgId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  res.status(204).send();
});

// GET /api/assets/:id/issues - Issues für Asset
router.get('/:id/issues', (req, res) => {
  const { id } = req.params;

  const issues = db.prepare(`
    SELECT * FROM issues
    WHERE asset_id = ?
    ORDER BY
      CASE severity
        WHEN 'kritisch' THEN 1
        WHEN 'schwerwiegend' THEN 2
        ELSE 3
      END,
      created_at DESC
  `).all(id);

  res.json(issues);
});

export default router;
