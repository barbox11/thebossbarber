import { Router } from 'express'
import { prisma } from '../db/prisma'

const router = Router()

router.post('/db-cleanup', async (req, res) => {
  const key = (req.headers['x-setup-key'] as string | undefined) || ''
  if (!process.env.SETUP_KEY || key !== process.env.SETUP_KEY) {
    return res.status(401).json({ error: 'No autorizado.' })
  }
  const id = String((req.body as { id?: unknown }).id || '')
  if (!id) return res.status(400).json({ error: 'Falta id.' })
  try {
    await prisma.appointment.deleteMany({ where: { id } })
    res.json({ ok: true, deleted: id })
  } catch (e) {
    res.status(500).json({ error: ((e as { message?: string }).message || String(e)).slice(0, 300) })
  }
})

export default router