import { Router } from 'express'
import { getStore } from '../db'
import { signToken, verifyPassword, requireAdmin } from '../lib/auth'
import { rateLimit } from '../lib/rate-limit'
import { loginSchema } from '../lib/schemas'

const router = Router()

router.post(
  '/login',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Credenciales inválidas.' })
    }
    const store = getStore()
    const user = await store.findAdminByEmail(parsed.data.email)
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
    }
    const token = signToken({ sub: user.id, email: user.email, role: user.role })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  },
)

router.get('/me', requireAdmin, (req, res) => {
  const admin = (req as typeof req & { admin?: { sub: string; email: string; role: string } }).admin
  if (!admin) return res.status(401).json({ error: 'No autorizado.' })
  res.json({ user: { id: admin.sub, email: admin.email, role: admin.role, name: 'Administrador' } })
})

export default router