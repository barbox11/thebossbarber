import { Router } from 'express'
import { getStore } from '../db'
import { rateLimit } from '../lib/rate-limit'
import { createBookingSchema } from '../lib/schemas'

const router = Router()

router.post(
  '/bookings',
  rateLimit({ windowMs: 60 * 1000, max: 8 }),
  async (req, res) => {
    const parsed = createBookingSchema.safeParse(req.body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return res.status(400).json({ error: first?.message ?? 'Datos inválidos.' })
    }
    const data = parsed.data
    const store = getStore()

    const result = await store.createBooking({
      serviceId: data.serviceId,
      date: data.date,
      time: data.time,
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      notes: data.notes || null,
    })

    if (!result.ok) {
      const status = result.code === 'slot_taken' ? 409 : 400
      return res.status(status).json({ ok: false, code: result.code, error: result.error })
    }

    const a = result.appointment!
    res.status(201).json({
      ok: true,
      appointment: {
        id: a.id,
        serviceId: a.serviceId,
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
      },
    })
  },
)

router.post('/bookings/cancel', async (req, res) => {
  const { id, phone } = (req.body ?? {}) as { id?: string; phone?: string }
  if (!id || !phone) return res.status(400).json({ error: 'Faltan datos.' })

  const store = getStore()
  const appointments = await store.listAppointments()
  const found = appointments.find(
    (a) => a.id === id && a.phoneSnapshot.replace(/\D/g, '') === phone.replace(/\D/g, ''),
  )
  if (!found) return res.status(404).json({ error: 'No encontramos esa cita.' })
  if (found.status === 'CANCELLED' || found.status === 'COMPLETED') {
    return res.status(400).json({ error: 'La cita ya no puede cancelarse.' })
  }
  await store.updateAppointmentStatus(found.id, 'CANCELLED')
  res.json({ ok: true })
})

export default router