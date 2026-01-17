import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

// WCAG-Kriterium aus axe-Tags extrahieren
const wcagTagMap = {
  'wcag2a': 'A',
  'wcag2aa': 'AA',
  'wcag2aaa': 'AAA',
  'wcag21a': 'A',
  'wcag21aa': 'AA',
  'wcag22aa': 'AA',
};

// axe-core impact zu unserem Severity mappen
const severityMap = {
  'critical': 'kritisch',
  'serious': 'schwerwiegend',
  'moderate': 'geringfuegig',
  'minor': 'geringfuegig',
};

// WCAG-Prinzip aus Kriterium ableiten
function getPrinciple(criterion) {
  if (!criterion) return null;
  const first = criterion.charAt(0);
  switch (first) {
    case '1': return 'Wahrnehmbar';
    case '2': return 'Bedienbar';
    case '3': return 'Verständlich';
    case '4': return 'Robust';
    default: return null;
  }
}

// WCAG-Kriterium aus axe-Tags extrahieren
function extractWcagCriterion(tags) {
  // Suche nach Pattern wie "wcag111" -> "1.1.1"
  for (const tag of tags) {
    const match = tag.match(/wcag(\d)(\d)(\d)/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}`;
    }
  }
  return '4.1.1'; // Fallback
}

// WCAG-Level aus Tags extrahieren
function extractWcagLevel(tags) {
  for (const tag of tags) {
    if (wcagTagMap[tag]) {
      return wcagTagMap[tag];
    }
  }
  return 'A';
}

export async function scanWebsite(url) {
  const startTime = Date.now();
  let browser = null;

  try {
    console.log(`Starting scan of ${url}...`);

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (compatible; A11yScanner/1.0)'
    });

    const page = await context.newPage();

    // Seite laden
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // axe-core ausführen
    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    // Zusätzliche manuelle Checks
    const customIssues = await runCustomChecks(page, url);

    // axe-Violations in unser Format konvertieren
    const issues = [];

    for (const violation of axeResults.violations) {
      for (const node of violation.nodes) {
        issues.push({
          wcag_criterion: extractWcagCriterion(violation.tags),
          wcag_level: extractWcagLevel(violation.tags),
          wcag_principle: getPrinciple(extractWcagCriterion(violation.tags)),
          severity: severityMap[violation.impact] || 'geringfuegig',
          title: violation.help,
          description: violation.description,
          element: node.html?.substring(0, 500),
          selector: node.target?.join(' '),
          page_url: url,
          recommendation: `${violation.helpUrl}\n\n${node.failureSummary || ''}`
        });
      }
    }

    // Custom Issues hinzufügen
    issues.push(...customIssues);

    // Score berechnen
    const score = calculateScore(issues, axeResults.passes.length);

    const duration = Date.now() - startTime;
    console.log(`Scan completed in ${duration}ms. Found ${issues.length} issues.`);

    return {
      success: true,
      score,
      issues,
      metadata: {
        url,
        scannedAt: new Date().toISOString(),
        duration,
        axePasses: axeResults.passes.length,
        axeViolations: axeResults.violations.length,
        axeIncomplete: axeResults.incomplete.length,
      }
    };

  } catch (error) {
    console.error('Scan failed:', error);
    return {
      success: false,
      error: error.message,
      score: 0,
      issues: [],
      metadata: {
        url,
        scannedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      }
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function runCustomChecks(page, url) {
  const issues = [];

  // 1. Skip-Link prüfen
  const skipLink = await page.$('a[href="#main"], a[href="#content"], a[href="#maincontent"], .skip-link, [class*="skip"]');
  if (!skipLink) {
    issues.push({
      wcag_criterion: '2.4.1',
      wcag_level: 'A',
      wcag_principle: 'Bedienbar',
      severity: 'schwerwiegend',
      title: 'Kein Skip-Link gefunden',
      description: 'Die Seite hat keinen Link zum Überspringen der Navigation.',
      recommendation: 'Fügen Sie einen Skip-Link als erstes fokussierbares Element hinzu: <a href="#main" class="skip-link">Zum Hauptinhalt springen</a>',
      page_url: url,
    });
  }

  // 2. Dokumentsprache prüfen
  const lang = await page.$eval('html', el => el.getAttribute('lang')).catch(() => null);
  if (!lang) {
    issues.push({
      wcag_criterion: '3.1.1',
      wcag_level: 'A',
      wcag_principle: 'Verständlich',
      severity: 'kritisch',
      title: 'Dokumentsprache nicht definiert',
      description: 'Das lang-Attribut im html-Element fehlt.',
      recommendation: 'Setzen Sie die Dokumentsprache: <html lang="de">',
      page_url: url,
    });
  } else if (!lang.startsWith('de') && !lang.startsWith('en')) {
    issues.push({
      wcag_criterion: '3.1.1',
      wcag_level: 'A',
      wcag_principle: 'Verständlich',
      severity: 'schwerwiegend',
      title: `Unerwartete Dokumentsprache: "${lang}"`,
      description: 'Die angegebene Sprache entspricht möglicherweise nicht dem Seiteninhalt.',
      recommendation: 'Prüfen Sie, ob die Sprache korrekt ist.',
      page_url: url,
    });
  }

  // 3. Viewport meta tag prüfen
  const viewport = await page.$('meta[name="viewport"]');
  if (viewport) {
    const content = await viewport.getAttribute('content');
    if (content?.includes('user-scalable=no') || content?.includes('maximum-scale=1')) {
      issues.push({
        wcag_criterion: '1.4.4',
        wcag_level: 'AA',
        wcag_principle: 'Wahrnehmbar',
        severity: 'schwerwiegend',
        title: 'Zoom ist deaktiviert',
        description: 'Das viewport meta-Tag verhindert, dass Nutzer die Seite zoomen können.',
        element: `<meta name="viewport" content="${content}">`,
        recommendation: 'Entfernen Sie user-scalable=no und maximum-scale=1 aus dem viewport meta-Tag.',
        page_url: url,
      });
    }
  }

  // 4. Titel prüfen
  const title = await page.title();
  if (!title || title.trim() === '') {
    issues.push({
      wcag_criterion: '2.4.2',
      wcag_level: 'A',
      wcag_principle: 'Bedienbar',
      severity: 'kritisch',
      title: 'Seitentitel fehlt',
      description: 'Die Seite hat keinen title-Element.',
      recommendation: 'Fügen Sie einen aussagekräftigen Seitentitel hinzu.',
      page_url: url,
    });
  }

  // 5. Überschriften-Hierarchie prüfen
  const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements =>
    elements.map(el => ({ level: parseInt(el.tagName[1]), text: el.textContent?.trim() }))
  );

  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count === 0) {
    issues.push({
      wcag_criterion: '1.3.1',
      wcag_level: 'A',
      wcag_principle: 'Wahrnehmbar',
      severity: 'schwerwiegend',
      title: 'Keine H1-Überschrift',
      description: 'Die Seite hat keine Hauptüberschrift (h1).',
      recommendation: 'Fügen Sie genau eine H1-Überschrift als Haupttitel der Seite hinzu.',
      page_url: url,
    });
  } else if (h1Count > 1) {
    issues.push({
      wcag_criterion: '1.3.1',
      wcag_level: 'A',
      wcag_principle: 'Wahrnehmbar',
      severity: 'geringfuegig',
      title: `Mehrere H1-Überschriften (${h1Count})`,
      description: 'Die Seite hat mehr als eine H1-Überschrift.',
      recommendation: 'Verwenden Sie nur eine H1-Überschrift pro Seite.',
      page_url: url,
    });
  }

  // Überschriften-Sprünge prüfen
  let lastLevel = 0;
  for (const heading of headings) {
    if (lastLevel > 0 && heading.level > lastLevel + 1) {
      issues.push({
        wcag_criterion: '1.3.1',
        wcag_level: 'A',
        wcag_principle: 'Wahrnehmbar',
        severity: 'geringfuegig',
        title: `Überschriften-Sprung: H${lastLevel} → H${heading.level}`,
        description: `Die Überschriftenebene springt von H${lastLevel} zu H${heading.level}.`,
        recommendation: 'Verwenden Sie eine logische Überschriftenhierarchie ohne Sprünge.',
        page_url: url,
      });
      break; // Nur ersten Sprung melden
    }
    lastLevel = heading.level;
  }

  return issues;
}

function calculateScore(issues, passCount) {
  // Gewichtung: kritisch = 10, schwerwiegend = 5, geringfügig = 1
  const weights = {
    'kritisch': 10,
    'schwerwiegend': 5,
    'geringfuegig': 1
  };

  const totalPenalty = issues.reduce((sum, issue) => {
    return sum + (weights[issue.severity] || 1);
  }, 0);

  // Basis-Score basierend auf Pass/Fail-Verhältnis
  const totalChecks = passCount + issues.length;
  const baseScore = totalChecks > 0 ? (passCount / totalChecks) * 100 : 100;

  // Penalty abziehen (max 50 Punkte)
  const penalty = Math.min(totalPenalty, 50);
  const score = Math.max(0, Math.round(baseScore - penalty));

  return score;
}

export default { scanWebsite };
