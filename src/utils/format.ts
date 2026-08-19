export const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const WEEKDAYS_FULL = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]
export const MONTHS_FULL = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

export function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

/** Fecha local "YYYY-MM-DD" a partir de un Date. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  return toDateKey(dt)
}

export function dateKeyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function dayOfWeek(key: string): number {
  return dateKeyToDate(key).getDay()
}

export function isPastDay(key: string): boolean {
  return key < todayKey()
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS_FULL[m - 1].charAt(0).toUpperCase()}${MONTHS_FULL[m - 1].slice(1)} ${y}`
}

export function formatDateLong(key: string): string {
  const dt = dateKeyToDate(key)
  return `${dt.getDate()} de ${MONTHS_FULL[dt.getMonth()]}`
}

export function formatDateFull(key: string): string {
  const dt = dateKeyToDate(key)
  return `${WEEKDAYS_FULL[dt.getDay()]} ${dt.getDate()} de ${MONTHS_FULL[dt.getMonth()]} de ${dt.getFullYear()}`
}

/** "HH:mm" 24h -> "2:00 PM" */
export function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${pad2(m)} ${suffix}`
}

export function minutesToLabel(min: number): string {
  return `${min} MIN`
}

export function formatCOP(amount: number): string {
  return `$${amount.toLocaleString('es-CO')}`
}
