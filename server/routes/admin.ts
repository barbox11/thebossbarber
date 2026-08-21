import { Router } from 'express'
import { getStore } from '../db'
import { requireAdmin } from '../lib/auth'
import { buildDashboard } from '../lib/dashboard'
import {
  blockedInputSchema,
  hourInputSchema,
  serviceInputSchema,
  serviceUpdateSchema,
  settingsUpdateSchema,
  updateStatusSchema,
} from '../lib/schemas'
import { utcToZonedTime, utcToZonedDateKey, BUSINESS_TZ } from '../lib/datetime'

const router = Router()
router.use(requireAdmin)

function mapAppointment(a: {
  id: string
  serviceId: string
  customerId: string
  slotStart: Date
  slotEnd: Date
  status: string
  priceAtBooking: number
  durationAtBooking: number
  nameSnapshot: string
  phoneSnapshot: string
  whatsappSnapshot: string | null
  emailSnapshot: string | null
  notes: string | null
  createdAt: Date
  service?: { id: string; name: string; price: number; durationMin: number } | null
  customer?: { id: string; name: string; phone: string; whatsapp: string | null; email: string | null } | null
}) {
  return {
    id: a.id,
    serviceId: a.serviceId,
    customerId: a.customerId,
    slotStart: a.slotStart.toISOString(),
    slotEnd: a.slotEnd.toISOString(),
    status: a.status,
    priceAtBooking: a.priceAtBooking,
    durationAtBooking: a.durationAtBooking,
    nameSnapshot: a.nameSnapshot,
    phoneSnapshot: a.phoneSnapshot,
    whatsappSnapshot: a.whatsappSnapshot,
    emailSnapshot: a.emailSnapshot,
    notes: a.notes,
    createdAt: a.createdAt.toISOString(),
    time: utcToZonedTime(a.slotStart, BUSINESS_TZ),
    date: utcToZonedDateKey(a.slotStart, BUSINESS_TZ),
    service: a.service ? { id: a.service.id, name: a.service.name, price: a.service.price, durationMin: a.service.durationMin } : undefined,
    customer: a.customer
      ? { id: a.customer.id, name: a.customer.name, phone: a.customer.phone, whatsapp: a.customer.whatsapp, email: a.customer.email }
      : undefined,
  }
}

router.get('/dashboard', async (_req, res) => {
  const store = getStore()
  const [appointments, hours, customers] = await Promise.all([
    store.listAppointments(),
    store.getHours(),
    store.listCustomers(),
  ])
  res.json(buildDashboard(appointments, hours, customers.length))
})

router.get('/appointments', async (_req, res) => {
  const store = getStore()
  const appointments = await store.listAppointments()
  res.json(appointments.map(mapAppointment))
})

router.patch('/appointments/:id/status', async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Estado inválido.' })
  const store = getStore()
  const updated = await store.updateAppointmentStatus(req.params.id, parsed.data.status)
  if (!updated) return res.status(404).json({ error: 'Reserva no encontrada.' })
  res.json(updated)
})

router.get('/hours', async (_req, res) => {
  const store = getStore()
  res.json(await store.getHours())
})

router.put('/hours', async (req, res) => {
  const body = req.body as { hours?: unknown }
  if (!Array.isArray(body.hours) || body.hours.length === 0) {
    return res.status(400).json({ error: 'Horarios inválidos.' })
  }
  const parsed = body.hours.map((h) => hourInputSchema.safeParse(h))
  if (parsed.some((p) => !p.success)) {
    return res.status(400).json({ error: 'Uno o más horarios son inválidos.' })
  }
  const store = getStore()
  const result = await store.upsertHours(parsed.map((p) => p.data!))
  res.json(result)
})

router.get('/blocked', async (_req, res) => {
  const store = getStore()
  const blocked = await store.getBlocked()
  res.json(
    blocked.map((b) => ({
      id: b.id,
      date: b.date.toISOString().slice(0, 10),
      startTime: b.startTime,
      endTime: b.endTime,
      reason: b.reason,
      allDay: b.allDay,
    })),
  )
})

router.post('/blocked', async (req, res) => {
  const parsed = blockedInputSchema.safeParse(req.body)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return res.status(400).json({ error: first?.message ?? 'Datos inválidos.' })
  }
  const store = getStore()
  const created = await store.createBlocked(parsed.data)
  res.status(201).json({
    id: created.id,
    date: created.date.toISOString().slice(0, 10),
    startTime: created.startTime,
    endTime: created.endTime,
    reason: created.reason,
    allDay: created.allDay,
  })
})

router.delete('/blocked/:id', async (req, res) => {
  const store = getStore()
  const ok = await store.deleteBlocked(req.params.id)
  if (!ok) return res.status(404).json({ error: 'Bloqueo no encontrado.' })
  res.json({ ok: true })
})

router.get('/services', async (_req, res) => {
  const store = getStore()
  res.json(await store.listServices(true))
})

router.post('/services', async (req, res) => {
  const parsed = serviceInputSchema.safeParse(req.body)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return res.status(400).json({ error: first?.message ?? 'Datos inválidos.' })
  }
  const store = getStore()
  const created = await store.createService(parsed.data)
  res.status(201).json(created)
})

router.patch('/services/:id', async (req, res) => {
  const parsed = serviceUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return res.status(400).json({ error: first?.message ?? 'Datos inválidos.' })
  }
  const store = getStore()
  const updated = await store.updateService(req.params.id, parsed.data)
  if (!updated) return res.status(404).json({ error: 'Servicio no encontrado.' })
  res.json(updated)
})

router.get('/customers', async (_req, res) => {
  const store = getStore()
  const customers = await store.listCustomers()
  res.json(
    customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      whatsapp: c.whatsapp,
      email: c.email,
      notes: c.notes,
      createdAt: c.createdAt.toISOString(),
      bookingsCount: c.bookingsCount,
      totalSpent: c.totalSpent,
      lastBookingAt: c.lastBookingAt ? c.lastBookingAt.toISOString() : null,
      canDelete: c.canDelete,
    })),
  )
})

router.delete('/customers/:id', async (req, res) => {
  const result = await getStore().deleteCustomer(req.params.id)
  if (result === 'not_found') return res.status(404).json({ error: 'Cliente no encontrado.' })
  if (result === 'not_completed') {
    return res.status(409).json({ error: 'No puedes eliminar un cliente con una cita confirmada.' })
  }
  res.json({ ok: true })
})

router.get('/settings', async (_req, res) => {
  const store = getStore()
  res.json(await store.getSettings())
})

router.put('/settings', async (req, res) => {
  const parsed = settingsUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return res.status(400).json({ error: first?.message ?? 'Datos inválidos.' })
  }
  const store = getStore()
  res.json(await store.updateSettings(parsed.data))
})

export default router