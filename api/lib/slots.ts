import {
  zonedTimeToUtc,
  utcToZonedTime,
  utcToZonedDateKey,
} from './datetime'
import type {
  AppointmentRecord,
  BlockedTimeRecord,
  BusinessHourRecord,
  MonthDayInfo,
  Slot,
} from '../db/types'

export const SLOT_STEP_MIN = 30
export const MIN_ADVANCE_MS = 30 * 60 * 1000

export interface AvailabilityContext {
  dateKey: string // YYYY-MM-DD local negocio
  hours: BusinessHourRecord[]
  blocked: BlockedTimeRecord[]
  appointments: AppointmentRecord[]
  serviceDurationMin: number
  now: Date
  tz: string
}

export function toMin(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minToHHMM(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function dayOfWeekOf(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

function dateKeyOfBlocked(b: BlockedTimeRecord): string {
  return utcToZonedDateKey(b.date, 'UTC') // stored as @db.Date (UTC midnight)
}

/** Construye los slots de un día aplicando horarios, bloqueos, citas y tiempo pasado. */
export function buildSlots(ctx: AvailabilityContext): Slot[] {
  const { dateKey, hours, blocked, appointments, serviceDurationMin, now, tz } = ctx
  const dow = dayOfWeekOf(dateKey)
  const hour = hours.find((h) => h.dayOfWeek === dow)
  if (!hour || !hour.isOpen) return []

  const dayBlocked = blocked.filter((b) => dateKeyOfBlocked(b) === dateKey)
  const allDayBlocked = dayBlocked.some((b) => b.allDay)
  const intervalBlocked = dayBlocked.filter((b) => !b.allDay)

  // Intervalos ocupados por citas (en minutos locales del negocio)
  const takenIntervals: Array<[number, number]> = appointments
    .filter((a) => utcToZonedDateKey(a.slotStart, tz) === dateKey)
    .map((a) => {
      const start = toMin(utcToZonedTime(a.slotStart, tz))
      const end = start + a.durationAtBooking
      return [start, end] as [number, number]
    })

  const openMin = toMin(hour.openTime)
  const closeMin = toMin(hour.closeTime)
  const slots: Slot[] = []

  for (let m = openMin; m + serviceDurationMin <= closeMin; m += SLOT_STEP_MIN) {
    const time = minToHHMM(m)
    const startUtc = zonedTimeToUtc(dateKey, time, tz)
    const past = startUtc.getTime() - now.getTime() < MIN_ADVANCE_MS

    const overlapsBlocked = intervalBlocked.some((b) => {
      const s = toMin(b.startTime)
      const e = toMin(b.endTime)
      return m < e && m + serviceDurationMin > s
    })
    const overlapsTaken = takenIntervals.some(([s, e]) => m < e && m + serviceDurationMin > s)

    const blockedSlot = past || allDayBlocked || overlapsBlocked
    slots.push({
      time,
      available: !blockedSlot && !overlapsTaken,
      blocked: blockedSlot,
    })
  }

  return slots
}

export function hasAnyAvailable(ctx: Omit<AvailabilityContext, 'dateKey'>, dateKey: string): boolean {
  return buildSlots({ ...ctx, dateKey }).some((s) => s.available)
}

/** Disponibilidad del mes: por cada día indica si abre, si está bloqueado y si quedan turnos. */
export function buildMonthAvailability(
  monthKey: string,
  ctx: Omit<AvailabilityContext, 'dateKey'>,
): Record<string, MonthDayInfo> {
  const [y, m] = monthKey.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const result: Record<string, MonthDayInfo> = {}
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${monthKey}-${String(d).padStart(2, '0')}`
    const dow = dayOfWeekOf(dateKey)
    const hour = ctx.hours.find((h) => h.dayOfWeek === dow)
    const allDayBlocked = ctx.blocked.some((b) => b.allDay && dateKeyOfBlocked(b) === dateKey)
    const open = Boolean(hour?.isOpen)
    result[dateKey] = {
      open,
      blocked: allDayBlocked || !open,
      hasSlots: open && !allDayBlocked ? hasAnyAvailable(ctx, dateKey) : false,
    }
  }
  return result
}