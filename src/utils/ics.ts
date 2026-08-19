import { zonedTimeToUtc } from '../../shared/datetime'

export interface CalendarEvent {
  title: string
  description?: string
  location?: string
  date: string // YYYY-MM-DD (hora local del negocio)
  startTime: string // HH:mm
  endTime: string // HH:mm
  tz: string
}

function fmt(date: Date): string {
  return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}T${pad2(
    date.getUTCHours(),
  )}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

/** Genera un archivo .ics listo para descargar. */
export function buildIcs(event: CalendarEvent): string {
  const dtStart = zonedTimeToUtc(event.date, event.startTime, event.tz)
  const dtEnd = zonedTimeToUtc(event.date, event.endTime, event.tz)
  const uid = `tbb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Boss Barber//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(dtStart)}`,
    `DTEND:${fmt(dtEnd)}`,
    `SUMMARY:${escapeText(event.title)}`,
    ...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
    ...(event.description ? [`DESCRIPTION:${escapeText(event.description)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Descarga el archivo .ics. */
export function downloadIcs(event: CalendarEvent): void {
  const blob = new Blob([buildIcs(event)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cita-the-boss-barber.ics'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}