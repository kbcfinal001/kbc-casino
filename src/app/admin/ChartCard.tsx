type Point = {
  label: string
  value: number
}

function buildPath(values: number[], width: number, height: number) {
  if (!values.length) return ''
  const max = Math.max(...values, 1)
  const stepX = values.length > 1 ? width / (values.length - 1) : width

  return values
    .map((v, i) => {
      const x = i * stepX
      const y = height - (v / max) * height
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`
    })
    .join(' ')
}

export default function ChartCard({
  title,
  color,
  points,
}: {
  title: string
  color: string
  points: Point[]
}) {
  const values = points.map((p) => p.value)
  const path = buildPath(values, 280, 90)

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="muted">{title}</p>
        <span className="text-sm text-gray-400">
          {points.length} days
        </span>
      </div>

      <div className="mt-4">
        <svg width="100%" height="100" viewBox="0 0 280 100" className="overflow-visible">
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{points[0]?.label || '-'}</span>
        <span>{points[points.length - 1]?.label || '-'}</span>
      </div>
    </div>
  )
}
