import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export default fp(async (app) => {
  // Auto-run migrations on startup (safe in production — idempotent)
  try {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env },
      stdio: 'inherit',
      timeout: 30_000,
    })
  } catch (e) {
    app.log.warn({ err: e }, 'prisma migrate deploy failed (non-fatal)')
  }

  const prisma = new PrismaClient()
  await prisma.$connect()
  app.decorate('prisma', prisma)
  app.addHook('onClose', async () => prisma.$disconnect())
})
