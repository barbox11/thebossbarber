import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { zonedTimeToUtc, BUSINESS_TZ } from '../lib/datetime'
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
  ServiceRecord,
} from './types'
import type { AdminRecord, BlockedInput, HourInput, ServiceInput, Store } from './store'

function isConnError(e: unknown): boolean {
  const code = (e as { code?: string } | undefined)?.code
  return code === 'P1001' || code === 'P1002' || code === 'P1017' || code === 'P2024'
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function withRetry<T>(fn: () => Promise<T>, attempts = 8): Promise<T> {
  let lastErr: unknown
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (isConnError(e) && i < attempts) {
        await sleep(1500 * i)
        continue
      }
      throw e
    }
  }
  throw lastErr
}

const prisma = new PrismaClient().$extends({
  query: {
    async $allOperations({ args, query }) {
      return withRetry(() => query(args))
    },
  },
})

export class PrismaStore implements Store {
  mode = 'postgres' as const
  private initialized = false

  async init(): Promise<void> {
    if (this.initialized) return
    this.initialized = true
    const count = await prisma.service.count()
    if (count > 0) return

    await withRetry(() =>
      prisma.$transaction(async (tx) => {
        for (const s of DEFAULT_SERVICES) {
          await tx.service.create({ data: { ...s } })
        }
        for (const h of DEFAULT_HOURS) {
          await tx.businessHour.create({ data: { ...h } })
        }
        for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
          await tx.businessSetting.upsert({
            where: { key },
            create: { key, value },
            update: {},
          })
        }
        await this.ensureAdmin(tx as unknown as Prisma.TransactionClient)
      }),
    )
  }

  private async ensureAdmin(tx: Prisma.TransactionClient): Promise<void> {
    const email = (process.env.ADMIN_EMAIL || 'admin@thebossbarber.com').toLowerCase()
    const existing = await tx.user.findUnique({ where: { email } })
    if (existing) return
    const password = process.env.ADMIN_PASSWORD || 'admin12345'
    await tx.user.create({
      data: {
        email,
        name: 'Administrador',
        passwordHash: await bcrypt.hash(password, 12),
        role: 'ADMIN',
      },
    })
  }

  listServices(includeInactive: boolean): Promise<ServiceRecord[]> {
    return prisma.service.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { sortOrder: 'asc' },
    })
  }

  createService(input: ServiceInput): Promise<ServiceRecord> {
    return prisma.service.create({ data: input })
  }

  async updateService(id: string, input: Partial<ServiceInput>): Promise<ServiceRecord | null> {
    try {
      return await prisma.service.update({ where: { id }, data: input })
    } catch {
      return null
    }
  }

  async getHours(): Promise<BusinessHourRecord[]> {
    const rows = await prisma.businessHour.findMany({ orderBy: { dayOfWeek: 'asc' } })
    return rows.length ? rows : DEFAULT_HOURS.map((h, i) => ({ ...h, id: `default-${i}` }))
  }

  async upsertHours(input: HourInput[]): Promise<BusinessHourRecord[]> {
    const tx = await withRetry(() =>
      prisma.$transaction(
        input.map((h) =>
          prisma.businessHour.upsert({
            where: { dayOfWeek: h.dayOfWeek },
            create: h,
            update: h,
          }),
        ),
      ),
    )
    return tx.sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  }

  getBlocked(): Promise<BlockedTimeRecord[]> {
    return prisma.blockedTime.findMany({ orderBy: { date: 'asc' } })
  }

  createBlocked(input: BlockedInput): Promise<BlockedTimeRecord> {
    return prisma.blockedTime.create({
      data: {
        date: new Date(`${input.date}T00:00:00.000Z`),
        startTime: input.allDay ? '00:00' : input.startTime ?? '00:00',
        endTime: input.allDay ? '23:59' : input.endTime ?? '23:59',
        reason: input.reason ?? null,
        allDay: input.allDay ?? false,
      },
    })
  }

  async deleteBlocked(id: string): Promise<boolean> {
    try {
      await prisma.blockedTime.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }

  async getSettings(): Promise<BusinessSettings> {
    const rows = await prisma.businessSetting.findMany()
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    return { ...DEFAULT_SETTINGS, ...map } as BusinessSettings
  }

  async updateSettings(patch: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const tx = await withRetry(() =>
      prisma.$transaction(
        Object.entries(patch).map(([key, value]) =>
          prisma.businessSetting.upsert({
            where: { key },
            create: { key, value: String(value) },
            update: { value: String(value) },
          }),
        ),
      ),
    )
    const map = Object.fromEntries(tx.map((r) => [r.key, r.value]))
    return { ...DEFAULT_SETTINGS, ...map } as BusinessSettings
  }

  findAdminByEmail(email: string): Promise<AdminRecord | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  }

  async listAppointments(): Promise<import('./types').AppointmentWithRelations[]> {
    return prisma.appointment.findMany({
      orderBy: { slotStart: 'desc' },
      include: { service: true, customer: true },
    }) as unknown as Promise<import('./types').AppointmentWithRelations[]>
  }

  listAppointmentsBetween(start: Date, end: Date): Promise<import('./types').AppointmentRecord[]> {
    return prisma.appointment.findMany({
      where: {
        slotStart: { lt: end },
        slotEnd: { gt: start },
      },
    }) as unknown as Promise<import('./types').AppointmentRecord[]>
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentRecord | null> {
    try {
      return await prisma.appointment.update({ where: { id }, data: { status } })
    } catch {
      return null
    }
  }

  async createBooking(input: BookingInput): Promise<BookingResult> {
    try {
      const result = await withRetry(() =>
        prisma.$transaction(
          async (tx) => {
          const service = await tx.service.findFirst({ where: { id: input.serviceId, active: true } })
          if (!service) {
            throw new BookingError('not_found', 'Servicio no encontrado.')
          }

          const dateKey = input.date
          const time = input.time
          const dayOfWeek = new Date(`${dateKey}T00:00:00`).getDay()
          const hour = await tx.businessHour.findUnique({ where: { dayOfWeek } })
          if (!hour?.isOpen) {
            throw new BookingError('closed', 'La barbería está cerrada ese día.')
          }

          const slotStart = zonedTimeToUtc(dateKey, time, BUSINESS_TZ)
          const slotEnd = new Date(slotStart.getTime() + service.durationMin * 60000)
          const startOfDay = new Date(`${dateKey}T00:00:00.000Z`)
          const endOfDay = new Date(`${dateKey}T23:59:59.999Z`)

          const dayBlocked = await tx.blockedTime.findMany({
            where: { date: { gte: startOfDay, lte: endOfDay } },
          })
          const allDayBlocked = dayBlocked.some((b) => b.allDay)
          const [startMin, endMin] = [toMin(time), toMin(time) + service.durationMin]
          const overlapsBlocked = dayBlocked.some(
            (b) => !b.allDay && startMin < toMin(b.endTime) && endMin > toMin(b.startTime),
          )
          if (allDayBlocked || overlapsBlocked) {
            throw new BookingError('blocked', 'Ese horario está bloqueado.')
          }

          const existing = await tx.appointment.findFirst({
            where: {
              status: 'CONFIRMED',
              slotStart: { lt: slotEnd },
              slotEnd: { gt: slotStart },
            },
          })
          if (existing) {
            throw new BookingError('slot_taken', 'Ese horario acaba de ser reservado. Elige otro.')
          }

          let customer = await tx.customer.findFirst({
            where: { phone: { equals: input.phone.replace(/\D/g, '') } },
          })
          if (!customer) {
            const matches = await tx.customer.findMany({ where: { phone: { contains: input.phone.replace(/\D/g, '') } } })
            customer = matches[0] ?? null
          }
          if (!customer) {
            customer = await tx.customer.create({
              data: {
                name: input.name,
                phone: input.phone,
                whatsapp: input.whatsapp,
                email: input.email,
                notes: input.notes,
              },
            })
          } else {
            customer = await tx.customer.update({
              where: { id: customer.id },
              data: {
                name: input.name,
                whatsapp: input.whatsapp ?? customer.whatsapp,
                email: input.email ?? customer.email,
              },
            })
          }

          const appointment = await tx.appointment.create({
            data: {
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
            },
            include: { service: true, customer: true },
          })

          return appointment
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ),
    )
      return { ok: true, appointment: result as unknown as AppointmentRecord }
    } catch (e) {
      if (e instanceof BookingError) {
        return { ok: false, code: e.code as BookingResult['code'], error: e.message }
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          return { ok: false, code: 'slot_taken', error: 'Ese horario acaba de ser reservado. Elige otro.' }
        }
        if (e.code === 'P2003') {
          return { ok: false, code: 'not_found', error: 'El servicio no existe.' }
        }
      }
      return { ok: false, code: 'invalid', error: 'No pudimos completar la reserva. Intenta de nuevo.' }
    }
  }

  async listCustomers() {
    const customers = await prisma.customer.findMany({
      include: {
        appointments: { orderBy: { slotStart: 'desc' } },
      },
    })
    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      whatsapp: c.whatsapp,
      email: c.email,
      notes: c.notes,
      createdAt: c.createdAt,
      bookingsCount: c.appointments.length,
      totalSpent: c.appointments.reduce((sum, a) => sum + a.priceAtBooking, 0),
      lastBookingAt: c.appointments[0]?.slotStart ?? null,
      canDelete: c.appointments.every((a) => a.status !== 'CONFIRMED'),
    }))
  }

  async deleteCustomer(id: string): Promise<'deleted' | 'not_found' | 'not_completed'> {
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id },
        include: { appointments: { select: { status: true } } },
      })
      if (!customer) return 'not_found'
      if (customer.appointments.some((a) => a.status === 'CONFIRMED')) {
        return 'not_completed'
      }
      await tx.appointment.deleteMany({ where: { customerId: id } })
      await tx.customer.delete({ where: { id } })
      return 'deleted'
    })
  }
}

class BookingError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

function toMin(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export { prisma }