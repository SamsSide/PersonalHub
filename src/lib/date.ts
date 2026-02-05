export function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function startOfWeek(date: Date) {
  const day = date.getDay()
  const diff = (day + 6) % 7
  const result = new Date(date)
  result.setDate(date.getDate() - diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function formatShortDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatDayName(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

export function formatTimeLabel(hour: number) {
  const label = new Date()
  label.setHours(hour, 0, 0, 0)
  return label.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function getLastNDates(count: number) {
  const dates: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d)
  }
  return dates
}
