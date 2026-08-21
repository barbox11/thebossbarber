import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { zonedTimeToUtc } from '../lib/datetime'
import { buildSlots } from '../lib/slots'
import { BUSINESS_TZ } from '../lib/datetime'
import {
  DEFAULT_HOURS,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
} from './types'
import type {
  AppointmentRecord,
  AppointmentStatus,
  BlockedTimeRecord,
  BookingInput,
  BookingResult,
  BusinessHourRecord,
  BusinessSettings,
  CustomerRecord,
  ServiceRecord,
} from './types'
import type { AdminRecord, BlockedInput, HourInput, ServiceInput, Store } from './store'

const nowIso = () => new Date()

let reserveQueue: Promise<unknown> = Promise.resolve()
/** Serializa las reservas en el store en memoria (equivalente a la transacción + índice único en Postgres). */
function serialized<T>(fn: () => T | Promise<T>): Promise<T> {
  const next = reserveQueue.then(fn, fn)
  reserveQueue = next.catch(() => undefined)
  return next
}

export class MemoryStore implements Store {
  mode = 'memory' as const

  private services: ServiceRecord[] = []
  private customers: CustomerRecord[] = []
  private appointments: AppointmentRecord[] = []
  private hours: BusinessHourRecord[] = []
  private blocked: BlockedTimeRecord[] = []
  private settings: BusinessSettings = { ...DEFAULT_SETTINGS }
  private admins: AdminRecord[] = []
  private adminEmail = ''
  private adminHash = ''

  async init(): Promise<void> {
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@thebossbarber.com'
    const rawPass = process.env.ADMIN_PASSWORD || 'admin12345'
    this.adminHash = await hash(rawPass)
    this.services = DEFAULT_SERVICES.map((s, i): ServiceRecord => ({
      name: s.name,
      description: s.description,
      price: s.price,
      durationMin: s.durationMin,
      active: s.active,
      sortOrder: i + 1,
      id: randomUUID(),
    }))
    this.hours = DEFAULT_HOURS.map((h) => ({ ...h, id: randomUUID() }))
    this.admins = [
      {
        id: randomUUID(),
        email: this.adminEmail,
        name: 'Administrador',
        passwordHash: this.adminHash,
        role: 'ADMIN',
      },
    ]
  }

  listServices(includeInactive: boolean): Promise<ServiceRecord[]> {
    const list = includeInactive ? this.services : this.services.filter((s) => s.active)
    return Promise.resolve([...list].sort((a, b) => a.sortOrder - b.sortOrder))
  }

  createService(input: ServiceInput): Promise<ServiceRecord> {
    const svc: ServiceRecord = {
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      durationMin: input.durationMin,
      active: input.active,
      sortOrder: input.sortOrder,
      id: randomUUID(),
    }
    this.services.push(svc)
    return Promise.resolve(svc)
  }

  updateService(id: string, input: Partial<ServiceInput>): Promise<ServiceRecord | null> {
    const idx = this.services.findIndex((s) => s.id === id)
    if (idx === -1) return Promise.resolve(null)
    this.services[idx] = { ...this.services[idx], ...input, id }
    return Promise.resolve(this.services[idx])
  }

  getHours(): Promise<BusinessHourRecord[]> {
    return Promise.resolve([...this.hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek))
  }

  upsertHours(input: HourInput[]): Promise<BusinessHourRecord[]> {
    for (const h of input) {
      const idx = this.hours.findIndex((x) => x.dayOfWeek === h.dayOfWeek)
      if (idx === -1) {
        this.hours.push({ ...h, id: randomUUID() })
      } else {
        this.hours[idx] = { ...this.hours[idx], ...h }
      }
    }
    return this.getHours()
  }

  getBlocked(): Promise<BlockedTimeRecord[]> {
    return Promise.resolve(
      [...this.blocked].sort((a, b) => a.date.getTime() - b.date.getTime() || a.startTime.localeCompare(b.startTime)),
    )
  }

  createBlocked(input: BlockedInput): Promise<BlockedTimeRecord> {
    const rec: BlockedTimeRecord = {
      id: randomUUID(),
      date: new Date(`${input.date}T00:00:00.000Z`),
      startTime: input.allDay ? '00:00' : input.startTime ?? '00:00',
      endTime: input.allDay ? '23:59' : input.endTime ?? '23:59',
      reason: input.reason ?? null,
      allDay: input.allDay ?? false,
    }
    this.blocked.push(rec)
    return Promise.resolve(rec)
  }

  deleteBlocked(id: string): Promise<boolean> {
    const before = this.blocked.length
    this.blocked = this.blocked.filter((b) => b.id !== id)
    return Promise.resolve(this.blocked.length < before)
  }

  getSettings(): Promise<BusinessSettings> {
    return Promise.resolve({ ...this.settings })
  }

  updateSettings(patch: Partial<BusinessSettings>): Promise<BusinessSettings> {
    this.settings = { ...this.settings, ...patch }
    return Promise.resolve({ ...this.settings })
  }

  findAdminByEmail(email: string): Promise<AdminRecord | null> {
    return Promise.resolve(this.admins.find((a) => a.email.toLowerCase() === email.toLowerCase()) ?? null)
  }

  listAppointments(): Promise<import('./types').AppointmentWithRelations[]> {
    const list = this.appointments.map((a) => ({
      ...a,
      service: this.services.find((s) => s.id === a.serviceId),
      customer: this.customers.find((c) => c.id === a.customerId),
    }))
    return Promise.resolve(list.sort((a, b) => a.slotStart.getTime() - b.slotStart.getTime()))
  }

  updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentRecord | null> {
    const idx = this.appointments.findIndex((a) => a.id === id)
    if (idx === -1) return Promise.resolve(null)
    this.appointments[idx] = { ...this.appointments[idx], status }
    return Promise.resolve(this.appointments[idx])
  }

  createBooking(input: BookingInput): Promise<BookingResult> {
    return serialized(() => this._reserve(input))
  }

  private _reserve(input: BookingInput): BookingResult | Promise<BookingResult> {
    const service = this.services.find((s) => s.id === input.serviceId && s.active)
    if (!service) return { ok: false, code: 'not_found', error: 'Servicio no encontrado.' }

    const dateKey = input.date
    const time = input.time
    const dayOfWeek = new Date(`${dateKey}T00:00:00`).getDay()
    const hour = this.hours.find((h) => h.dayOfWeek === dayOfWeek)
    if (!hour?.isOpen) return { ok: false, code: 'closed', error: 'La barbería está cerrada ese día.' }

    const slotStart = zonedTimeToUtc(dateKey, time, BUSINESS_TZ)
    const slotEnd = new Date(slotStart.getTime() + service.durationMin * 60000)
    const dayBlocked = this.blocked.filter((b) => {
      const bk = b.date.toISOString().slice(0, 10)
      return bk === dateKey
    })
    const allDayBlocked = dayBlocked.some((b) => b.allDay)
    const [startMin, endMin] = [toMin(time), toMin(time) + service.durationMin]
    const overlapsBlocked = dayBlocked.some(
      (b) => !b.allDay && startMin < toMin(b.endTime) && endMin > toMin(b.startTime),
    )
    if (allDayBlocked || overlapsBlocked) {
      return { ok: false, code: 'blocked', error: 'Ese horario está bloqueado.' }
    }

    const taken = this.appointments.some(
      (a) =>
        a.status === 'CONFIRMED' &&
        a.slotStart.getTime() < slotEnd.getTime() &&
        a.slotEnd.getTime() > slotStart.getTime(),
    )
    if (taken) {
      return { ok: false, code: 'slot_taken', error: 'Ese horario acaba de ser reservado. Elige otro.' }
    }

    let customer = this.customers.find(
      (c) => c.phone.replace(/\D/g, '') === input.phone.replace(/\D/g, ''),
    )
    if (!customer) {
      customer = {
        id: randomUUID(),
        name: input.name,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email,
        notes: input.notes,
        createdAt: nowIso(),
      }
      this.customers.push(customer)
    } else {
      customer = {
        ...customer,
        name: input.name,
        whatsapp: input.whatsapp ?? customer.whatsapp,
        email: input.email ?? customer.email,
      }
      const ci = this.customers.findIndex((c) => c.id === customer!.id)
      this.customers[ci] = customer
    }

    const appointment: AppointmentRecord = {
      id: randomUUID(),
      serviceId: service.id,
      customerId: customer.id,
      slotStart,
      slotEnd,
      status: 'CONFIRMED',
      priceAtBooking: service.price,
      durationAtBooking: service.durationMin,
      nameSnapshot: input.name,
      phoneSnapshot: input.phone,
      whatsappSnapshot: input.whatsapp,
      emailSnapshot: input.email,
      notes: input.notes,
      createdAt: nowIso(),
    }
    this.appointments.push(appointment)
    return { ok: true, appointment }
  }

  listCustomers(): Promise<Array<CustomerRecord & { bookingsCount: number; totalSpent: number; lastBookingAt: Date | null; canDelete: boolean }>> {
    const list = this.customers.map((c) => {
      const own = this.appointments.filter((a) => a.customerId === c.id)
      const last = own.sort((a, b) => b.slotStart.getTime() - a.slotStart.getTime())[0] ?? null
      return {
        ...c,
        bookingsCount: own.length,
        totalSpent: own.reduce((sum, a) => sum + a.priceAtBooking, 0),
        lastBookingAt: last ? last.slotStart : null,
        canDelete: own.length > 0 && own.every((a) => a.status !== 'CONFIRMED'),
      }
    })
    return Promise.resolve(list.sort((a, b) => b.bookingsCount - a.bookingsCount))
  }

  deleteCustomer(id: string): Promise<'deleted' | 'not_found' | 'not_completed'> {
    const customer = this.customers.find((c) => c.id === id)
    if (!customer) return Promise.resolve('not_found')
    const own = this.appointments.filter((a) => a.customerId === id)
    if (own.length === 0 || own.some((a) => a.status === 'CONFIRMED')) return Promise.resolve('not_completed')
    this.appointments = this.appointments.filter((a) => a.customerId !== id)
    this.customers = this.customers.filter((c) => c.id !== id)
    return Promise.resolve('deleted')
  }
}

function toMin(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

async function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export { buildSlots }
export type { Store }