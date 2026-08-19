import { pad2, toDateKey, WEEKDAYS_SHORT } from './format'

export interface CalendarDay {
  key: string // YYYY-MM-DD
  day: number
  inMonth: boolean
  weekday: number
}

export const CALENDAR_WEEKDAYS = WEEKDAYS_SHORT

export function monthKeyOf(key: string): string {
  return key.slice(0, 7) // YYYY-MM
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return toDateKey(d).slice(0, 7)
}

/** Devuelve la cuadrícula del mes (con días de relleno de meses vecinos). */
export function buildMonthGrid(monthKey: string): CalendarDay[] {
  const [y, m] = monthKey.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const daysInMonth = new Date(y, m, 0).getDate()
  const startPad = first.getDay()

  const days: CalendarDay[] = []
  for (let i = 0; i < startPad; i++) {
    const d = new Date(y, m - 1, i - startPad + 1)
    const key = toDateKey(d)
    days.push({ key, day: d.getDate(), inMonth: false, weekday: d.getDay() })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(y, m - 1, i)
    days.push({ key: toDateKey(d), day: i, inMonth: true, weekday: d.getDay() })
  }
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1]
    const d = new Date(`${last.key}T00:00:00`)
    d.setDate(d.getDate() + 1)
    days.push({ key: toDateKey(d), day: d.getDate(), inMonth: false, weekday: d.getDay() })
  }
  return days
}

export function maxSelectableMonth(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 2)
  return toDateKey(d).slice(0, 7)
}

export function minSelectableMonth(): string {
  return toDateKey(new Date()).slice(0, 7)
}

export { pad2 }