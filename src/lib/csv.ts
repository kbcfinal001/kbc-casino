export function toCsv(rows: Record<string, unknown>[]) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return ''
  }

  const headers = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((key) => set.add(key))
      return set
    }, new Set<string>())
  )

  const escapeCSV = (value: unknown) => {
    if (value === null || value === undefined) return ''
    return `"${String(value).replace(/"/g, '""')}"`
  }

  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeCSV(row[header])).join(',')
    ),
  ]

  return csvRows.join('\n')
}

export const convertToCSV = toCsv