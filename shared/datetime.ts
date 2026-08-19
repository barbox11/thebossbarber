/**
 * Utilidades de zona horaria compartidas entre frontend y backend.
 * La barbería opera en una zona horaria fija (America/Bogota).
 * Los horarios de reserva se expresan siempre como "reloj local del negocio"
 * (fecha "YYYY-MM-DD" + hora "HH:mm") y se convierten a UTC para almacenarlos.
 */

export function timeZoneOffsetMinutes(localDate: string, localTime: string, tz: string): number {
  const probe = new Date(`${localDate}T${localTime}:00.000Z`)
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(
    (fmt.formatToParts(probe) as Intl.DateTimeFormatPart[]).map((p) => [p.type, p.value]),
  )
  const wall = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return (wall - probe.getTime()) / 60000
}

/** Fecha+hora local del negocio -> Date UTC. */
export function zonedTimeToUtc(dateStr: string, timeStr: string, tz: string): Date {
  const offset = timeZoneOffsetMinutes(dateStr, timeStr, tz)
  const local = new Date(`${dateStr}T${timeStr}:00.000Z`)
  return new Date(local.getTime() - offset * 60000)
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

/** Date UTC -> clave local "YYYY-MM-DD" en la zona del negocio. */
export function utcToZonedDateKey(utc: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(utc) as Intl.DateTimeFormatPart[]
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]))
  return `${p.year}-${p.month}-${p.day}`
}

export function utcToZonedTime(utc: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(utc) as Intl.DateTimeFormatPart[]
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]))
  return `${p.hour}:${p.minute}`
}

export function utcToZonedMonthKey(utc: Date, tz: string): string {
  return utcToZonedDateKey(utc, tz).slice(0, 7)
}