import express from 'express'
import cors from 'cors'
import type { Request, Response, NextFunction } from 'express'
import { initStore } from './db'
import publicRoutes from './routes/public'
import authRoutes from './routes/auth'
import bookingRoutes from './routes/bookings'
import adminRoutes from './routes/admin'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',') ?? true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  )
  app.use(express.json({ limit: '256kb' }))

  app.get('/api/health', async (_req, res) => {
    res.json({ ok: true, mode: (await initStore()).mode, time: new Date().toISOString() })
  })

  app.use('/api', publicRoutes)
  app.use('/api', authRoutes)
  app.use('/api', bookingRoutes)
  app.use('/api/admin', adminRoutes)

  app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' })
  })

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[api] error:', err)
    res.status(500).json({ error: 'Error interno del servidor.' })
  })

  return app
}

export default createApp