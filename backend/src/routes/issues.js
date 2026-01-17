import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// GET /api/issues - Alle Issues
router.get('/', (req, res) => {
  const orgId = req.user.organizationId;
  const { status, severity, wcag_criterion, asset_id } = req.query;

  let query = `
    SELECT
      i.*,
      a.name as asset_name,
      a.type as asset_type
    FROM issues i
    JOIN assets a ON i.asset_id = a.id
    WHERE a.organization_id = ?
  `;
  const params = [orgId];

  if (status) {
    query += ' AND i.status = ?';
    params.push(status);
  }

  if (severity) {
    query += ' AND i.severity = ?';
    params.push(severity);
  }

  if (wcag_criterion) {
    query += ' AND i.wcag_criterion = ?';
    params.push(wcag_criterion);
  }

  if (asset_id) {
    query += ' AND i.asset_id = ?';
    params.push(asset_id);
  }

  query += ` ORDER BY
    CASE i.severity
      WHEN 'kritisch' THEN 1
      WHEN 'schwerwiegend' THEN 2
      ELSE 3
    END,
    i.created_at DESC`;

  const issues = db.prepare(query).all(...params);
  res.json(issues);
});

// GET /api/issues/by-wcag - Gruppiert nach WCAG-Kriterium
router.get('/by-wcag', (req, res) => {
  const orgId = req.user.organizationId;

  const issues = db.prepare(`
    SELECT
      i.wcag_criterion,
      i.wcag_principle,
      i.wcag_level,
      COUNT(*) as count,
      SUM(CASE WHEN i.status = 'offen' THEN 1 ELSE 0 END) as open_count
    FROM issues i
    JOIN assets a ON i.asset_id = a.id
    WHERE a.organization_id = ?
    GROUP BY i.wcag_criterion
    ORDER BY i.wcag_criterion
  `).all(orgId);

  res.json(issues);
});

// GET /api/issues/:id - Einzelnes Issue
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const issue = db.prepare(`
    SELECT
      i.*,
      a.name as asset_name,
      a.type as asset_type
    FROM issues i
    JOIN assets a ON i.asset_id = a.id
    WHERE i.id = ?
  `).get(id);

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  res.json(issue);
});

// PATCH /api/issues/:id - Issue aktualisieren
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { status, assigned_to, resolution_notes } = req.body;

  const existing = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  let updates = [];
  let params = [];

  if (status) {
    updates.push('status = ?');
    params.push(status);

    if (status === 'behoben') {
      updates.push('resolved_at = datetime("now")');
      updates.push('resolved_by = ?');
      params.push(req.user.id);
    }
  }

  if (assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    params.push(assigned_to);
    updates.push('assigned_at = datetime("now")');
  }

  if (resolution_notes) {
    updates.push('resolution_notes = ?');
    params.push(resolution_notes);
  }

  if (updates.length > 0) {
    params.push(id);
    db.prepare(`
      UPDATE issues SET ${updates.join(', ')} WHERE id = ?
    `).run(...params);
  }

  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);
  res.json(issue);
});

// POST /api/issues/:id/ai-suggestion - KI-Empfehlung generieren
router.post('/:id/ai-suggestion', async (req, res) => {
  const { id } = req.params;

  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  // Ollama-Anfrage (falls verfügbar)
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

  try {
    const prompt = `
Du bist ein Experte für digitale Barrierefreiheit nach WCAG 2.1 und BITV 2.0.

Ein Prüfwerkzeug hat folgenden Fehler gefunden:

**WCAG-Kriterium:** ${issue.wcag_criterion}
**Titel:** ${issue.title}
**Beschreibung:** ${issue.description}
${issue.element ? `**Betroffenes Element:**\n\`\`\`\n${issue.element}\n\`\`\`` : ''}

Gib eine konkrete, umsetzbare Handlungsempfehlung auf Deutsch.
1. Erkläre kurz (1-2 Sätze), warum dieser Fehler ein Problem für Nutzer mit Behinderungen ist.
2. Zeige dann die konkrete Lösung oder den korrigierten Code.

Halte die Antwort unter 200 Wörtern.
`;

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
        prompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 500 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const suggestion = data.response;

      // Speichern
      db.prepare(`
        UPDATE issues
        SET ai_suggestion = ?, ai_suggestion_generated_at = datetime('now')
        WHERE id = ?
      `).run(suggestion, id);

      res.json({ suggestion });
    } else {
      res.status(503).json({ error: 'Ollama service unavailable' });
    }
  } catch (error) {
    console.error('Ollama error:', error);
    res.status(503).json({ error: 'AI service unavailable', details: error.message });
  }
});

export default router;
