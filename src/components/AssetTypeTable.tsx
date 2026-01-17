import type { AssetsByType } from '../types'

interface AssetTypeTableProps {
  data: AssetsByType[]
}

const typeLabels: Record<string, string> = {
  confluence: 'Confluence',
  pdf: 'PDF-Dokumente',
  pptx: 'Präsentationen',
  website: 'Webseiten',
}

export function AssetTypeTable({ data }: AssetTypeTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Übersicht nach Asset-Typ
      </h3>

      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-gray-200">
            <th scope="col" className="text-left py-3 px-2 text-sm font-medium text-gray-600">
              Asset-Typ
            </th>
            <th scope="col" className="text-right py-3 px-2 text-sm font-medium text-gray-600">
              Geprüft
            </th>
            <th scope="col" className="text-right py-3 px-2 text-sm font-medium text-gray-600">
              Konform
            </th>
            <th scope="col" className="text-right py-3 px-2 text-sm font-medium text-gray-600">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.type} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-2 text-gray-900">
                {typeLabels[row.type] || row.type}
              </td>
              <td className="py-3 px-2 text-right text-gray-700">
                {row.total}
              </td>
              <td className="py-3 px-2 text-right text-gray-700">
                {row.conform} ({row.total > 0 ? Math.round((row.conform / row.total) * 100) : 0}%)
              </td>
              <td className="py-3 px-2 text-right">
                <span
                  className={`font-medium ${
                    row.score >= 80
                      ? 'text-success'
                      : row.score >= 50
                      ? 'text-warning'
                      : 'text-error'
                  }`}
                >
                  {row.score}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          Noch keine Assets vorhanden.
        </p>
      )}
    </div>
  )
}
