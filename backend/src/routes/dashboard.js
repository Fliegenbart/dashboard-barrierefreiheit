import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// GET /api/dashboard/stats - Gesamtstatistiken
router.get('/stats', (req, res) => {
  const orgId = req.user.organizationId;

  // Assets zählen
  const assetStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      AVG(current_score) as average_score,
      SUM(CASE WHEN status = 'konform' THEN 1 ELSE 0 END) as conform_count,
      SUM(CASE WHEN status = 'teilweise' THEN 1 ELSE 0 END) as partial_count,
      SUM(CASE WHEN status = 'nicht-konform' THEN 1 ELSE 0 END) as non_conform_count,
      SUM(CASE WHEN status = 'ungeprueft' THEN 1 ELSE 0 END) as unchecked_count
    FROM assets
    WHERE organization_id = ? AND deleted_at IS NULL
  `).get(orgId);

  // Top-Issues
  const topIssues = db.prepare(`
    SELECT
      wcag_criterion as criterion,
      title,
      COUNT(*) as count
    FROM issues i
    JOIN assets a ON i.asset_id = a.id
    WHERE a.organization_id = ? AND i.status = 'offen'
    GROUP BY wcag_criterion
    ORDER BY count DESC
    LIMIT 5
  `).all(orgId);

  // Score-Historie
  const scoreHistory = db.prepare(`
    SELECT date, average_score as score
    FROM score_history
    WHERE organization_id = ?
    ORDER BY date ASC
    LIMIT 12
  `).all(orgId);

  res.json({
    totalAssets: assetStats.total || 0,
    averageScore: Math.round(assetStats.average_score) || 0,
    conformCount: assetStats.conform_count || 0,
    partialCount: assetStats.partial_count || 0,
    nonConformCount: assetStats.non_conform_count || 0,
    uncheckedCount: assetStats.unchecked_count || 0,
    topIssues,
    scoreHistory
  });
});

// GET /api/dashboard/by-type - Stats nach Asset-Typ
router.get('/by-type', (req, res) => {
  const orgId = req.user.organizationId;

  const byType = db.prepare(`
    SELECT
      type,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'konform' THEN 1 ELSE 0 END) as conform,
      ROUND(AVG(current_score)) as score
    FROM assets
    WHERE organization_id = ? AND deleted_at IS NULL
    GROUP BY type
  `).all(orgId);

  res.json(byType);
});

export default router;
