import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me'
const JWT_EXPIRES_IN = '12h'

export interface JwtPayload {
  sub: string
  email: string
  role: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/** Middleware: valida el Bearer token y exige rol ADMIN. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'No autorizado.' })
  }
  try {
    const payload = verifyToken(token)
    if (payload.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso restringido.' })
    }
    ;(req as Request & { admin?: JwtPayload }).admin = payload
    return next()
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' })
  }
}