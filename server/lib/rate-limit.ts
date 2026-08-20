/**
 * Rate limiting en memoria por IP. Suficiente para proteger endpoints
 * públicos (reservas) y de autenticación en un despliegue serverless de Vercel.
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(opts: { windowMs: number; max: number }) {
  return (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || req.ip || 'unknown'
    const now = Date.now()
    const key = `${opts.windowMs}:${ip}`
    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
      return next()
    }

    bucket.count += 1
    if (bucket.count > opts.max) {
      return res.status(429).json({ error: 'Demasiados intentos. Intenta más tarde.' })
    }
    return next()
  }
}

export function cleanupBuckets(): void {
  const now = Date.now()
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key)
  }
}

setInterval(cleanupBuckets, 10 * 60 * 1000).unref()