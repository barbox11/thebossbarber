import { Router } from 'express'
import { getStore } from '../db'
import { buildSlots, buildMonthAvailability } from '../lib/slots'
import { BUSINESS_TZ } from '../lib/datetime'

const router = Router()

router.get('/services', async (_req, res) => {
  const store = getStore()
  const services = await store.listServices(false)
  res.json(services)
})

router.get('/hours', async (_req, res) => {
  const store = getStore()
  const hours = await store.getHours()
  res.json(hours)
})

router.get('/settings/public', async (_req, res) => {
  const store = getStore()
  res.json(await store.getSettings())
})

router.get('/availability', async (req, res) => {
  const { date, serviceId } = req.query as { date?: string; serviceId?: string }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Fecha inválida.' })
  }

  const store = getStore()
  const [hours, blocked, appointments, services] = await Promise.all([
    store.getHours(),
    store.getBlocked(),
    store.listAppointments(),
    store.listServices(false),
  ])

  const service = serviceId ? services.find((s) => s.id === serviceId) : services[0]
  if (!service) return res.json({ date, slots: [], isOpen: false })

  const slots = buildSlots({
    dateKey: date,
    hours,
    blocked,
    appointments,
    serviceDurationMin: service.durationMin,
    now: new Date(),
    tz: BUSINESS_TZ,
  })

  const dow = new Date(`${date}T00:00:00`).getDay()
  const hour = hours.find((h) => h.dayOfWeek === dow)
  res.json({ date, slots, isOpen: Boolean(hour?.isOpen) })
})

router.get('/availability/month', async (req, res) => {
  const { month, serviceId } = req.query as { month?: string; serviceId?: string }
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Mes inválido.' })
  }

  const store = getStore()
  const [hours, blocked, appointments, services] = await Promise.all([
    store.getHours(),
    store.getBlocked(),
    store.listAppointments(),
    store.listServices(false),
  ])

  const service = serviceId ? services.find((s) => s.id === serviceId) : services[0]
  if (!service) return res.json({ month, days: {} })

  const days = buildMonthAvailability(month, {
    hours,
    blocked,
    appointments,
    serviceDurationMin: service.durationMin,
    now: new Date(),
    tz: BUSINESS_TZ,
  })

  res.json({ month, days })
})

export default router