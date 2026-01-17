interface TopIssue {
  criterion: string
  count: number
  title: string
}

interface TopIssuesListProps {
  issues: TopIssue[]
}

export function TopIssuesList({ issues }: TopIssuesListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top-5-Probleme
      </h3>

      {issues.length > 0 ? (
        <ul className="space-y-3" aria-label="Häufigste Barrierefreiheitsfehler">
          {issues.map((issue, index) => (
            <li
              key={issue.criterion}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full bg-error text-white text-xs flex items-center justify-center"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  <span className="text-primary">{issue.criterion}</span>
                  {' – '}
                  {issue.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {issue.count} betroffene{issue.count === 1 ? 's Asset' : ' Assets'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-4">
          Keine Fehler gefunden.
        </p>
      )}
    </div>
  )
}
