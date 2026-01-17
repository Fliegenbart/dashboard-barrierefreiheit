import { useState } from 'react'

interface FormData {
  organization: string
  websiteUrl: string
  contactName: string
  contactEmail: string
  conformanceStatus: 'vollstaendig' | 'teilweise' | 'nicht'
  nonAccessibleContent: string
  feedbackEmail: string
}

export function Erklaerung() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    organization: 'Deutsche Rentenversicherung',
    websiteUrl: '',
    contactName: '',
    contactEmail: '',
    conformanceStatus: 'teilweise',
    nonAccessibleContent: '',
    feedbackEmail: '',
  })
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null)

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateStatement = () => {
    const statusText = {
      vollstaendig: 'vollständig konform',
      teilweise: 'teilweise konform',
      nicht: 'nicht konform',
    }

    const html = `
<h1>Erklärung zur Barrierefreiheit</h1>

<p>${formData.organization} ist bemüht, ihre Website und mobile Anwendungen im Einklang mit den Bestimmungen des Behindertengleichstellungsgesetzes des Bundes (BGG) sowie der Barrierefreie-Informationstechnik-Verordnung (BITV 2.0) zur Umsetzung der Richtlinie (EU) 2016/2102 barrierefrei zugänglich zu machen.</p>

<h2>Stand der Konformität</h2>

<p>Diese Webseite ist mit den Anforderungen der BITV 2.0 / WCAG 2.1 Level AA <strong>${statusText[formData.conformanceStatus]}</strong>.</p>

${formData.conformanceStatus !== 'vollstaendig' && formData.nonAccessibleContent ? `
<h2>Nicht barrierefreie Inhalte</h2>

<p>Die nachstehend aufgeführten Inhalte sind aus folgenden Gründen nicht barrierefrei:</p>

<p>${formData.nonAccessibleContent.replace(/\n/g, '<br>')}</p>
` : ''}

<h2>Feedback und Kontaktangaben</h2>

<p>Sie können uns Mängel in Bezug auf die Einhaltung der Barrierefreiheitsanforderungen mitteilen. Nutzen Sie dafür bitte folgende Kontaktmöglichkeit:</p>

<p>
E-Mail: <a href="mailto:${formData.feedbackEmail}">${formData.feedbackEmail}</a><br>
${formData.contactName ? `Ansprechperson: ${formData.contactName}<br>` : ''}
</p>

<h2>Durchsetzungsverfahren</h2>

<p>Sollten Sie auf Mitteilungen oder Anfragen zur Barrierefreiheit innerhalb von sechs Wochen keine zufriedenstellende Antwort erhalten haben, können Sie die Schlichtungsstelle nach § 16 BGG einschalten.</p>

<p>
Schlichtungsstelle nach dem Behindertengleichstellungsgesetz<br>
bei dem Beauftragten der Bundesregierung für die Belange von Menschen mit Behinderungen<br>
Mauerstraße 53<br>
10117 Berlin<br>
E-Mail: <a href="mailto:info@schlichtungsstelle-bgg.de">info@schlichtungsstelle-bgg.de</a><br>
Website: <a href="https://www.schlichtungsstelle-bgg.de">www.schlichtungsstelle-bgg.de</a>
</p>

<p><em>Diese Erklärung wurde am ${new Date().toLocaleDateString('de-DE')} erstellt.</em></p>
`.trim()

    setGeneratedHtml(html)
    setStep(5)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Barrierefreiheitserklärung Generator</h2>

      {/* Fortschrittsanzeige */}
      <nav aria-label="Fortschritt">
        <ol className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <li key={s} className="flex items-center">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s === step
                    ? 'bg-primary text-white'
                    : s < step
                    ? 'bg-success text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
                aria-current={s === step ? 'step' : undefined}
              >
                {s < step ? '✓' : s}
              </span>
              {s < 4 && <span className="w-8 h-0.5 bg-gray-200 mx-1" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </nav>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {/* Schritt 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schritt 1: Grunddaten</h3>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                Name der Organisation *
              </label>
              <input
                type="text"
                id="organization"
                value={formData.organization}
                onChange={(e) => updateField('organization', e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL des Webangebots *
              </label>
              <input
                type="url"
                id="websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => updateField('websiteUrl', e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                Ansprechperson
              </label>
              <input
                type="text"
                id="contactName"
                value={formData.contactName}
                onChange={(e) => updateField('contactName', e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail der Ansprechperson *
              </label>
              <input
                type="email"
                id="contactEmail"
                value={formData.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Weiter →
            </button>
          </div>
        )}

        {/* Schritt 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schritt 2: Konformitätsstatus</h3>

            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2">
                Stand der Konformität mit BITV 2.0 / WCAG 2.1 AA *
              </legend>

              <div className="space-y-2">
                {[
                  { value: 'vollstaendig', label: 'Vollständig konform' },
                  { value: 'teilweise', label: 'Teilweise konform' },
                  { value: 'nicht', label: 'Nicht konform' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="conformanceStatus"
                      value={option.value}
                      checked={formData.conformanceStatus === option.value}
                      onChange={(e) =>
                        updateField('conformanceStatus', e.target.value as FormData['conformanceStatus'])
                      }
                      className="text-primary focus:ring-primary"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Zurück
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Weiter →
              </button>
            </div>
          </div>
        )}

        {/* Schritt 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schritt 3: Nicht barrierefreie Inhalte</h3>

            <div>
              <label htmlFor="nonAccessibleContent" className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung der nicht barrierefreien Inhalte
              </label>
              <textarea
                id="nonAccessibleContent"
                value={formData.nonAccessibleContent}
                onChange={(e) => updateField('nonAccessibleContent', e.target.value)}
                rows={6}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Beschreiben Sie hier, welche Inhalte nicht barrierefrei sind und warum..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Zurück
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Weiter →
              </button>
            </div>
          </div>
        )}

        {/* Schritt 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schritt 4: Feedback-Mechanismus</h3>

            <div>
              <label htmlFor="feedbackEmail" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail-Adresse für Feedback zur Barrierefreiheit *
              </label>
              <input
                type="email"
                id="feedbackEmail"
                value={formData.feedbackEmail}
                onChange={(e) => updateField('feedbackEmail', e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Zurück
              </button>
              <button
                type="button"
                onClick={generateStatement}
                className="px-6 py-2 bg-success text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Erklärung generieren
              </button>
            </div>
          </div>
        )}

        {/* Ergebnis */}
        {step === 5 && generatedHtml && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generierte Barrierefreiheitserklärung</h3>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedHtml)
                  alert('HTML in Zwischenablage kopiert!')
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                HTML kopieren
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Neue Erklärung
              </button>
            </div>

            <div className="border rounded-lg p-6 bg-gray-50">
              <h4 className="font-medium text-gray-700 mb-2">Vorschau:</h4>
              <div
                className="prose max-w-none bg-white p-4 rounded border"
                dangerouslySetInnerHTML={{ __html: generatedHtml }}
              />
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-700 mb-2">HTML-Code:</h4>
              <pre className="text-sm overflow-x-auto bg-gray-900 text-gray-100 p-4 rounded">
                <code>{generatedHtml}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
