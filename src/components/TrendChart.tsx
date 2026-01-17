import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendChartProps {
  data: { date: string; score: number }[]
}

export function TrendChart({ data }: TrendChartProps) {
  // Datum formatieren
  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('de-DE', {
      month: 'short',
      year: '2-digit',
    }),
  }))

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Trendverlauf (letzte 12 Monate)
      </h3>

      {/* Tabellarische Fallback-Darstellung für Screenreader */}
      <table className="sr-only" aria-label="Score-Verlauf der letzten 12 Monate">
        <thead>
          <tr>
            <th scope="col">Monat</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          {formattedData.map((d) => (
            <tr key={d.date}>
              <td>{d.dateLabel}</td>
              <td>{d.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Visuelles Chart */}
      <div aria-hidden="true" className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Score']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#005a9c"
              strokeWidth={2}
              dot={{ fill: '#005a9c', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
