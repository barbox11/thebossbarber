import { utcToZonedDateKey, utcToZonedTime, BUSINESS_TZ } from './datetime'
import { toMin, minToHHMM, SLOT_STEP_MIN } from './slots'
import type { AppointmentWithRelations, BusinessHourRecord } from '../db/types'

export interface DashboardSummary {
  todayBookings: number
  monthBookings: number
  monthRevenue: number
  customers: number
  completed: number
  cancelled: number
  occupancyRate: number
  todayAppointments: Array<Record<string, unknown>>
  bookingsByDay: { label: string; value: number }[]
  revenueByDay: { label: string; value: number }[]
  servicesByBookings: { label: string; value: number }[]
  busyHours: { label: string; value: number }[]
}

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function iso(d: Date): string {
  return d.toISOString()
}

export function buildDashboard(
  appointments: AppointmentWithRelations[],
  hours: BusinessHourRecord[],
  customerCount: number,
): DashboardSummary {
  const now = new Date()
  const todayKey = utcToZonedDateKey(now, BUSINESS_TZ)
  const monthKey = todayKey.slice(0, 7)

  const inMonth = (a: AppointmentWithRelations) => utcToZonedDateKey(a.slotStart, BUSINESS_TZ).slice(0, 7) === monthKey
  const isToday = (a: AppointmentWithRelations) => utcToZonedDateKey(a.slotStart, BUSINESS_TZ) === todayKey

  const monthActive = appointments.filter((a) => inMonth(a) && (a.status === 'CONFIRMED' || a.status === 'COMPLETED'))
  const todayAppointments = appointments
    .filter((a) => isToday(a) && a.status === 'CONFIRMED')
    .sort((a, b) => a.slotStart.getTime() - b.slotStart.getTime())

  const monthRevenue = monthActive.reduce((sum, a) => sum + a.priceAtBooking, 0)
  const completed = appointments.filter((a) => inMonth(a) && a.status === 'COMPLETED').length
  const cancelled = appointments.filter((a) => inMonth(a) && a.status === 'CANCELLED').length

  // Ocupación del mes: citas activas / capacidad total (slots de 30 min en días abiertos)
  const year = Number(monthKey.slice(0, 4))
  const month = Number(monthKey.slice(5, 7))
  const daysInMonth = new Date(year, month, 0).getDate()
  let capacity = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay()
    const h = hours.find((x) => x.dayOfWeek === dow)
    if (h?.isOpen) {
      capacity += Math.floor((toMin(h.closeTime) - toMin(h.openTime)) / SLOT_STEP_MIN)
    }
  }
  const occupancyRate = capacity > 0 ? Math.min(100, Math.round((monthActive.length * 100) / capacity)) : 0

  // Últimos 7 días: reservas e ingresos
  const bookingsByDay: { label: string; value: number }[] = []
  const revenueByDay: { label: string; value: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const dayKey = utcToZonedDateKey(d, BUSINESS_TZ)
    const dayAppointments = appointments.filter(
      (a) => utcToZonedDateKey(a.slotStart, BUSINESS_TZ) === dayKey && a.status !== 'CANCELLED',
    )
    const label = WEEKDAY_LABELS[d.getDay()]
    bookingsByDay.push({ label, value: dayAppointments.length })
    revenueByDay.push({ label, value: dayAppointments.reduce((s, a) => s + a.priceAtBooking, 0) })
  }

  // Servicios más reservados (mes)
  const serviceCount = new Map<string, number>()
  for (const a of monthActive) {
    const name = a.service?.name ?? 'Otro'
    serviceCount.set(name, (serviceCount.get(name) ?? 0) + 1)
  }
  const servicesByBookings = [...serviceCount.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Horarios más solicitados (mes)
  const hourCount = new Map<string, number>()
  for (const a of monthActive) {
    const t = utcToZonedTime(a.slotStart, BUSINESS_TZ).slice(0, 2)
    hourCount.set(t, (hourCount.get(t) ?? 0) + 1)
  }
  const busyHours = [...hourCount.entries()]
    .map(([h, value]) => ({ label: `${h}:00`, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  return {
    todayBookings: todayAppointments.length,
    monthBookings: monthActive.length,
    monthRevenue,
    customers: customerCount,
    completed,
    cancelled,
    occupancyRate,
    todayAppointments: todayAppointments.map((a) => ({
      id: a.id,
      name: a.nameSnapshot,
      service: a.service?.name ?? '—',
      time: utcToZonedTime(a.slotStart, BUSINESS_TZ),
      status: a.status,
      price: a.priceAtBooking,
      phone: a.phoneSnapshot,
      slotStart: iso(a.slotStart),
    })),
    bookingsByDay,
    revenueByDay,
    servicesByBookings,
    busyHours,
  }
}

export { minToHHMM }