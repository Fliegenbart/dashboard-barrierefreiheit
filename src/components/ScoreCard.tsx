interface ScoreCardProps {
  title: string
  score: number
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
}

export function ScoreCard({ title, score, subtitle, trend }: ScoreCardProps) {
  const getStatusInfo = (score: number) => {
    if (score >= 80) return { label: 'Gut', icon: '✓', colorClass: 'text-success', bgClass: 'bg-green-50' }
    if (score >= 50) return { label: 'Verbesserungsbedarf', icon: '⚠', colorClass: 'text-warning', bgClass: 'bg-orange-50' }
    return { label: 'Kritisch', icon: '✗', colorClass: 'text-error', bgClass: 'bg-red-50' }
  }

  const status = getStatusInfo(score)
  const trendLabels = { up: 'steigend ↑', down: 'fallend ↓', stable: 'stabil →' }

  return (
    <article
      className={`rounded-xl p-6 shadow-sm border ${status.bgClass}`}
      aria-labelledby={`score-title-${title.replace(/\s/g, '-')}`}
    >
      <h3
        id={`score-title-${title.replace(/\s/g, '-')}`}
        className="text-sm font-medium text-gray-600 mb-2"
      >
        {title}
      </h3>

      <div className="flex items-end gap-4">
        {/* Score */}
        <div
          role="meter"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${title}: ${score} von 100 Prozent`}
          className="text-4xl font-bold text-gray-900"
        >
          <span aria-hidden="true">{score}%</span>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-1 ${status.colorClass}`}>
          <span aria-hidden="true">{status.icon}</span>
          <span className="text-sm font-medium">{status.label}</span>
        </div>
      </div>

      {/* Trend & Subtitle */}
      <div className="mt-3 text-sm text-gray-500">
        {trend && (
          <span className="mr-2">
            <span className="sr-only">Trend: </span>
            {trendLabels[trend]}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </article>
  )
}
