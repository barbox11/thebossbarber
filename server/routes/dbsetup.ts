import { Router } from 'express'
import { prisma } from '../db/prisma'
import { MIGRATION_SQL, BACKUP } from '../db-setup-data'

const router = Router()

router.post('/db-setup', async (req, res) => {
  const key = (req.headers['x-setup-key'] as string | undefined) || ''
  if (!process.env.SETUP_KEY || key !== process.env.SETUP_KEY) {
    return res.status(401).json({ error: 'No autorizado.' })
  }

  const out: Record<string, number | string> = {}
  try {
    out.migration = 'ok'
    const statements = MIGRATION_SQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt + ';')
    }

    await prisma.$transaction(async (tx) => {
      for (const u of BACKUP.users as any[]) {
        await tx.user.upsert({ where: { id: u.id }, create: u, update: {} })
      }
      for (const s of BACKUP.services as any[]) {
        await tx.service.upsert({ where: { id: s.id }, create: s, update: {} })
      }
      for (const c of BACKUP.customers as any[]) {
        await tx.customer.upsert({ where: { id: c.id }, create: c, update: {} })
      }
      for (const a of BACKUP.appointments as any[]) {
        await tx.appointment.upsert({ where: { id: a.id }, create: a, update: {} })
      }
      for (const h of BACKUP.businessHours as any[]) {
        await tx.businessHour.upsert({ where: { id: h.id }, create: h, update: {} })
      }
      for (const b of BACKUP.blockedTimes as any[]) {
        await tx.blockedTime.upsert({ where: { id: b.id }, create: b, update: {} })
      }
      for (const s of BACKUP.businessSettings as any[]) {
        await tx.businessSetting.upsert({ where: { key: s.key }, create: s, update: {} })
      }
    }, { timeout: 120000 })

    for (const k of Object.keys(BACKUP) as (keyof typeof BACKUP)[]) {
      out[k] = BACKUP[k].length
    }
    out.done = 'ok'
  } catch (e) {
    const msg = (e as { message?: string }).message || String(e)
    return res.status(500).json({ error: msg.slice(0, 500) })
  }
  res.json(out)
})

export default router