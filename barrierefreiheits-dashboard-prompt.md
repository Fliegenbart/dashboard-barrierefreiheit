# Prompt: Barrierefreiheits-Dashboard für Behörden

## Projektkontext

Entwickle ein **Barrierefreiheits-Dashboard** für die Deutsche Rentenversicherung (DRV) im Rahmen der rvEvolution-Modernisierungsinitiative. Das Dashboard soll den BITV 2.0 / WCAG 2.1 AA Compliance-Status aller digitalen Assets (Confluence-Seiten, PDFs, PowerPoint-Präsentationen) zentral visualisieren und Handlungsempfehlungen geben.

**Zielgruppe:** Redakteure, Fachbereiche und Barrierefreiheitsbeauftragte in Behörden ohne tiefe technische Kenntnisse.

**Kernprinzipien:**
- On-Premise-fähig (kein Cloud-Zwang)
- DSGVO-konform (keine externen API-Calls für sensible Daten)
- Das Dashboard selbst muss BITV 2.0 / WCAG 2.1 AA erfüllen
- Deutsche Benutzeroberfläche

---

## Technische Anforderungen

### Stack
- **Frontend:** React 18+ mit TypeScript
- **Styling:** Tailwind CSS mit barrierefreien Komponenten
- **Charts:** Recharts oder Chart.js (beide screenreader-kompatibel konfigurierbar)
- **Backend:** Node.js/Express oder Python/FastAPI (optional, kann auch rein client-seitig mit localStorage starten)
- **Datenbank:** SQLite für On-Premise, optional PostgreSQL
- **KI-Integration:** Ollama (lokale LLMs) für Textanalyse und Empfehlungen – KEINE Cloud-APIs

### Barrierefreiheit des Dashboards selbst
Das Dashboard MUSS folgende Kriterien erfüllen:
- Vollständige Tastaturbedienbarkeit (alle Interaktionen ohne Maus)
- Skip-Links zu Hauptbereichen
- ARIA-Labels für alle interaktiven Elemente
- Farbkontrast mindestens 4.5:1 (Text) und 3:1 (UI-Komponenten)
- Fokus-Indikatoren sichtbar (nicht nur outline: none)
- Screenreader-kompatible Datentabellen mit scope und headers
- Charts mit Textalternativen (tabellarische Darstellung als Fallback)
- Keine Informationen nur durch Farbe vermittelt
- Responsive Design (funktioniert auf 320px Breite)
- Reduzierte Bewegung respektieren (prefers-reduced-motion)

---

## Hauptfunktionen

### 1. Übersichts-Dashboard (Startseite)

**Gesamtscore-Anzeige:**
- Kreisdiagramm oder Fortschrittsbalken mit Prozent-Score (0-100%)
- Score-Berechnung: Gewichteter Durchschnitt aller geprüften Assets
- Farbkodierung: Rot (<50%), Gelb (50-80%), Grün (>80%)
- WICHTIG: Zusätzlich zur Farbe immer Icon oder Textlabel verwenden

**Trendverlauf:**
- Liniendiagramm der letzten 12 Monate
- Meilensteine markieren (z.B. "BITV-Audit durchgeführt")
- Exportierbar als CSV für Berichte

**Schnellübersicht nach Asset-Typ:**
```
┌─────────────────┬──────────┬────────────┬─────────────┐
│ Asset-Typ       │ Geprüft  │ Konform    │ Score       │
├─────────────────┼──────────┼────────────┼─────────────┤
│ Confluence      │ 1.247    │ 892 (72%)  │ 76%         │
│ PDF-Dokumente   │ 3.891    │ 2.102 (54%)│ 61%         │
│ Präsentationen  │ 456      │ 298 (65%)  │ 71%         │
└─────────────────┴──────────┴────────────┴─────────────┘
```

**Top-5-Probleme:**
- Liste der häufigsten Barrierefreiheitsfehler
- Mit Anzahl betroffener Assets
- Link zur gefilterten Detailansicht

---

### 2. Asset-Verwaltung

**Listenansicht aller Assets:**
- Tabelle mit Sortierung und Filterung
- Spalten: Name, Typ, Bereich/Space, Letzter Scan, Score, Status
- Bulk-Aktionen: "Erneut prüfen", "Exportieren", "Zuweisen"

**Filter:**
- Nach Asset-Typ (Confluence, PDF, PPTX)
- Nach Bereich/Abteilung
- Nach Score-Range
- Nach Fehlertyp
- Nach Prüfdatum

**Detailansicht pro Asset:**
- Vollständiger Prüfbericht
- Liste aller gefundenen Fehler mit:
  - WCAG-Kriterium (z.B. "1.1.1 Nicht-Text-Inhalt")
  - Schweregrad (Kritisch, Schwerwiegend, Geringfügig)
  - Betroffenes Element (mit Code-Snippet wenn möglich)
  - Konkrete Handlungsempfehlung
  - KI-generierter Lösungsvorschlag (via Ollama)
- Verlauf der Scores für dieses Asset

---

### 3. Fehler-Katalog

**Übersicht aller Fehlertypen:**
Gruppiert nach WCAG-Prinzip:
1. **Wahrnehmbar** (Perceivable)
   - 1.1 Textalternativen
   - 1.2 Zeitbasierte Medien
   - 1.3 Anpassbar
   - 1.4 Unterscheidbar
2. **Bedienbar** (Operable)
   - 2.1 Tastaturzugänglich
   - 2.2 Ausreichend Zeit
   - 2.3 Anfälle und körperliche Reaktionen
   - 2.4 Navigierbar
   - 2.5 Eingabemodalitäten
3. **Verständlich** (Understandable)
   - 3.1 Lesbar
   - 3.2 Vorhersehbar
   - 3.3 Eingabehilfe
4. **Robust** (Robust)
   - 4.1 Kompatibel

**Pro Fehlertyp:**
- Verständliche Erklärung auf Deutsch (keine Fachsprache)
- Warum ist das ein Problem? (mit Beispiel aus Nutzersicht)
- Wie behebt man es? (Schritt-für-Schritt)
- Betroffene Assets (verlinkt)

---

### 4. Barrierefreiheitserklärung Generator

**Wizard mit folgenden Schritten:**

**Schritt 1: Grunddaten**
- Name der Behörde/Organisation
- URL des Webangebots
- Kontaktdaten des Verantwortlichen
- Kontaktdaten der Aufsichtsbehörde

**Schritt 2: Konformitätsstatus**
- Automatisch befüllt aus Dashboard-Daten
- Auswahl: "vollständig konform" / "teilweise konform" / "nicht konform"
- Begründung bei teilweiser Konformität

**Schritt 3: Nicht barrierefreie Inhalte**
- Automatisch aus Prüfergebnissen generiert
- Redakteur kann ergänzen/anpassen
- Angabe von Gründen (technisch, unverhältnismäßige Belastung, etc.)
- Geplantes Datum der Behebung

**Schritt 4: Feedback-Mechanismus**
- Konfiguration des Kontaktwegs
- Vorlagen für Antwortschreiben

**Schritt 5: Durchsetzungsverfahren**
- Verlinkung zur zuständigen Schlichtungsstelle
- Landesspezifisch konfigurierbar

**Output:**
- HTML-Seite (direkt in Confluence/CMS einfügbar)
- PDF-Export
- Strukturierte Daten (JSON) für maschinelle Verarbeitung

---

### 5. Berichts-Modul

**Automatisierte Berichte:**
- Wöchentlicher Status-Report per E-Mail
- Monatlicher Management-Report (PDF)
- Quartals-Bericht für Aufsichtsbehörden

**Enthaltene Informationen:**
- Executive Summary (1 Seite)
- Gesamtscore und Trend
- Top-Verbesserungen seit letztem Bericht
- Kritische offene Probleme
- Empfohlene Prioritäten

**Export-Formate:**
- PDF (barrierefrei nach PDF/UA)
- Excel/CSV (für weitere Analyse)
- HTML

---

### 6. Geführte manuelle Tests

**Interaktiver Prüfassistent:**
Führt durch die ~50 manuellen Prüfschritte der EN 301 549, die nicht automatisiert testbar sind.

**Beispiel-Prüfschritte:**
```
┌────────────────────────────────────────────────────────────────┐
│ Prüfschritt 2.4.3: Fokus-Reihenfolge                          │
├────────────────────────────────────────────────────────────────┤
│ Anleitung:                                                     │
│ 1. Navigieren Sie mit der Tab-Taste durch die Seite           │
│ 2. Ist die Reihenfolge logisch und nachvollziehbar?           │
│ 3. Werden alle interaktiven Elemente erreicht?                │
│                                                                │
│ [Video-Tutorial ansehen]                                       │
│                                                                │
│ Ergebnis:                                                      │
│ ○ Bestanden  ○ Nicht bestanden  ○ Nicht anwendbar             │
│                                                                │
│ Anmerkungen: [________________]                                │
│                                                                │
│ [← Zurück]  [Weiter →]                                        │
└────────────────────────────────────────────────────────────────┘
```

**Features:**
- Fortschrittsanzeige
- Zwischenspeicherung (kann unterbrochen werden)
- Ergebnisse fließen in Gesamtscore ein
- Erinnerungen für Wiederholungstests (alle 6 Monate)

---

### 7. Daten-Import

**Unterstützte Quellen:**

**Confluence-Integration:**
- REST-API-Anbindung
- Automatischer Scan aller Seiten eines Spaces
- Webhook für neue/geänderte Seiten

**PDF-Import:**
- Drag & Drop Upload
- Verzeichnis-Überwachung (Watch Folder)
- Integration mit bestehendem PPTX→PDF-Converter

**Manueller Import:**
- CSV-Upload mit Prüfergebnissen
- JSON-API für externe Tools

---

## Datenmodell

```typescript
// Haupt-Entitäten

interface Asset {
  id: string;
  name: string;
  type: 'confluence' | 'pdf' | 'pptx' | 'website';
  url?: string;
  filePath?: string;
  department: string;
  space?: string; // für Confluence
  createdAt: Date;
  lastScannedAt: Date;
  currentScore: number; // 0-100
  status: 'konform' | 'teilweise' | 'nicht-konform' | 'ungeprüft';
}

interface ScanResult {
  id: string;
  assetId: string;
  scannedAt: Date;
  score: number;
  issues: Issue[];
  scanType: 'automatisch' | 'manuell' | 'kombiniert';
  scannerVersion: string;
}

interface Issue {
  id: string;
  scanResultId: string;
  wcagCriterion: string; // z.B. "1.1.1"
  wcagLevel: 'A' | 'AA' | 'AAA';
  severity: 'kritisch' | 'schwerwiegend' | 'geringfügig';
  title: string;
  description: string;
  element?: string; // betroffenes HTML-Element oder Seite
  recommendation: string;
  aiSuggestion?: string; // Ollama-generiert
  status: 'offen' | 'in-bearbeitung' | 'behoben' | 'akzeptiert';
  assignedTo?: string;
}

interface AccessibilityStatement {
  id: string;
  version: number;
  createdAt: Date;
  publishedAt?: Date;
  organizationName: string;
  websiteUrl: string;
  conformanceStatus: 'vollständig' | 'teilweise' | 'nicht';
  nonAccessibleContent: NonAccessibleContent[];
  feedbackContact: Contact;
  enforcementContact: Contact;
  htmlContent: string;
  pdfPath?: string;
}

interface ManualTestResult {
  id: string;
  assetId: string;
  testerId: string;
  testDate: Date;
  checklistItems: ChecklistItem[];
  overallResult: 'bestanden' | 'nicht-bestanden' | 'teilweise';
  notes: string;
}
```

---

## UI/UX-Anforderungen

### Navigation
```
┌─────────────────────────────────────────────────────────────────┐
│ [Skip to main content]                                          │
├─────────────────────────────────────────────────────────────────┤
│ 🏛️ Barrierefreiheits-Dashboard        [Suche] [Benutzer] [⚙️]   │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│ 📊 Übersicht │  [Hauptinhalt]                                   │
│ 📁 Assets    │                                                  │
│ ⚠️ Fehler    │                                                  │
│ 📝 Erklärung │                                                  │
│ 📈 Berichte  │                                                  │
│ ✓ Tests      │                                                  │
│ ⚙️ Einstellung│                                                  │
│              │                                                  │
├──────────────┴──────────────────────────────────────────────────┤
│ © DRV | Impressum | Datenschutz | Barrierefreiheit              │
└─────────────────────────────────────────────────────────────────┘
```

### Farbschema (WCAG-konform)
```css
:root {
  /* Primärfarben */
  --color-primary: #005a9c;        /* DRV-Blau, Kontrast 7.2:1 auf Weiß */
  --color-primary-dark: #003d6b;   /* Hover-Zustand */
  
  /* Status-Farben (immer mit Icon kombinieren!) */
  --color-success: #2e7d32;        /* Grün, Kontrast 4.7:1 */
  --color-warning: #f57c00;        /* Orange, Kontrast 3.1:1 - nur für große Texte */
  --color-error: #c62828;          /* Rot, Kontrast 5.9:1 */
  
  /* Neutral */
  --color-text: #1a1a1a;           /* Fast Schwarz, Kontrast 16:1 */
  --color-text-secondary: #4a4a4a; /* Grau, Kontrast 7.7:1 */
  --color-background: #ffffff;
  --color-surface: #f5f5f5;
  
  /* Fokus */
  --color-focus: #ff6f00;          /* Orange, gut sichtbar */
}
```

### Komponenten-Bibliothek
Verwende oder erstelle barrierefreie Komponenten:
- **Button:** Mit sichtbarem Fokus, aria-label bei Icon-only
- **Tabelle:** Mit scope, sortierbar per Tastatur
- **Modal:** Fokus-Trap, Escape zum Schließen, aria-modal
- **Dropdown:** Tastaturnavigation mit Pfeiltasten
- **Tabs:** aria-selected, Panel-Verknüpfung
- **Toast/Notification:** role="alert" für wichtige Meldungen
- **Progress:** aria-valuenow, aria-valuemin, aria-valuemax

---

## Beispiel-Implementierung: Score-Karte

```tsx
// ScoreCard.tsx - Barrierefreie Implementierung

interface ScoreCardProps {
  title: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, trend, lastUpdated }) => {
  const getStatusInfo = (score: number) => {
    if (score >= 80) return { label: 'Gut', icon: '✓', colorClass: 'text-success' };
    if (score >= 50) return { label: 'Verbesserungsbedarf', icon: '⚠', colorClass: 'text-warning' };
    return { label: 'Kritisch', icon: '✗', colorClass: 'text-error' };
  };

  const status = getStatusInfo(score);
  const trendLabels = { up: 'steigend', down: 'fallend', stable: 'stabil' };

  return (
    <article 
      className="score-card"
      aria-labelledby={`score-title-${title}`}
    >
      <h3 id={`score-title-${title}`} className="score-card__title">
        {title}
      </h3>
      
      <div className="score-card__content">
        {/* Score-Anzeige mit Screenreader-Text */}
        <div 
          className="score-card__score"
          role="meter"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Barrierefreiheits-Score: ${score} von 100 Prozent`}
        >
          <span className="score-card__number" aria-hidden="true">
            {score}%
          </span>
        </div>

        {/* Status mit Icon UND Text (nicht nur Farbe) */}
        <p className={`score-card__status ${status.colorClass}`}>
          <span aria-hidden="true">{status.icon}</span>
          <span className="sr-only">Status:</span>
          {status.label}
        </p>

        {/* Trend */}
        <p className="score-card__trend">
          <span className="sr-only">Trend:</span>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'stable' && '→'}
          {trendLabels[trend]}
        </p>

        {/* Zeitstempel */}
        <p className="score-card__updated">
          <span className="sr-only">Zuletzt aktualisiert:</span>
          <time dateTime={lastUpdated.toISOString()}>
            {lastUpdated.toLocaleDateString('de-DE')}
          </time>
        </p>
      </div>
    </article>
  );
};
```

---

## Ollama-Integration für KI-Empfehlungen

```typescript
// services/aiRecommendation.ts

interface AIRecommendationRequest {
  issue: Issue;
  assetContext: string; // z.B. HTML-Snippet oder Confluence-Inhalt
}

async function getAIRecommendation(request: AIRecommendationRequest): Promise<string> {
  const prompt = `
Du bist ein Experte für digitale Barrierefreiheit nach WCAG 2.1 und BITV 2.0.

Ein Prüfwerkzeug hat folgenden Fehler gefunden:

**WCAG-Kriterium:** ${request.issue.wcagCriterion}
**Fehlerbeschreibung:** ${request.issue.description}
**Betroffenes Element:** 
\`\`\`
${request.issue.element}
\`\`\`

**Kontext:**
${request.assetContext}

Gib eine konkrete, umsetzbare Handlungsempfehlung auf Deutsch.
Erkläre kurz, warum dieser Fehler ein Problem für Nutzer mit Behinderungen ist.
Zeige dann den korrigierten Code oder die korrigierte Formulierung.

Antworte in maximal 200 Wörtern.
`;

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b', // oder mistral, je nach Installation
      prompt,
      stream: false,
      options: {
        temperature: 0.3, // Niedrig für konsistente, sachliche Antworten
        num_predict: 500
      }
    })
  });

  const data = await response.json();
  return data.response;
}
```

---

## Deployment-Optionen

### Option A: Standalone Desktop-App (Electron)
- Für einzelne Redakteure
- SQLite-Datenbank lokal
- Kein Server erforderlich

### Option B: Docker On-Premise
```yaml
# docker-compose.yml
version: '3.8'
services:
  dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/a11y
      - OLLAMA_URL=http://ollama:11434
    depends_on:
      - db
      - ollama

  db:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data

  ollama:
    image: ollama/ollama
    volumes:
      - ollama_models:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu] # Optional für schnellere KI

volumes:
  pgdata:
  ollama_models:
```

### Option C: Intranet-Deployment
- Hinter DRV-Firewall
- LDAP/AD-Authentifizierung
- Integration mit bestehendem Confluence-Server

---

## Akzeptanzkriterien

Das Dashboard gilt als fertig, wenn:

1. [ ] Startseite zeigt aggregierten Score aller Assets
2. [ ] Trendverlauf der letzten 6 Monate visualisiert
3. [ ] Assets können gefiltert und sortiert werden
4. [ ] Detailansicht zeigt alle Fehler mit Handlungsempfehlung
5. [ ] KI-Empfehlungen werden via Ollama generiert
6. [ ] Barrierefreiheitserklärung kann generiert werden
7. [ ] PDF-Export des Berichts funktioniert
8. [ ] Dashboard selbst besteht WAVE/axe Audit ohne kritische Fehler
9. [ ] Vollständige Tastaturbedienung möglich
10. [ ] Screenreader-Test mit NVDA bestanden

---

## Weiterführende Ressourcen

- WCAG 2.1 Richtlinien: https://www.w3.org/TR/WCAG21/
- BITV 2.0: https://www.gesetze-im-internet.de/bitv_2_0/
- EN 301 549: https://www.etsi.org/deliver/etsi_en/301500_301599/301549/
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- Accessible React Components: https://react-spectrum.adobe.com/react-aria/
