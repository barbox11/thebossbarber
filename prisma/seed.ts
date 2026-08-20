import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_HOURS, DEFAULT_SERVICES, DEFAULT_SETTINGS } from '../server/db/types'

const prisma = new PrismaClient()

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@thebossbarber.com').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'admin12345'
  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$transaction(
    async (tx) => {
      const svcCount = await tx.service.count()
      if (svcCount === 0) {
        for (const s of DEFAULT_SERVICES) {
          await tx.service.create({ data: { ...s } })
        }
        console.log('Servicios por defecto creados.')
      }

      const hourCount = await tx.businessHour.count()
      if (hourCount === 0) {
        for (const h of DEFAULT_HOURS) {
          await tx.businessHour.create({ data: { ...h } })
        }
        console.log('Horarios por defecto creados.')
      }

      for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        await tx.businessSetting.upsert({ where: { key }, create: { key, value }, update: {} })
      }

      const existing = await tx.user.findUnique({ where: { email } })
      if (!existing) {
        await tx.user.create({
          data: { email, name: 'Administrador', passwordHash, role: 'ADMIN' },
        })
        console.log(`Usuario admin creado: ${email}`)
      } else {
        console.log('Usuario admin ya existe.')
      }
    },
    { timeout: 60000 },
  )

  console.log('Seed completado.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())