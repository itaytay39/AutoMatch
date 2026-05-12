import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import prismaPlugin from './plugins/prisma.js'
import metricsPlugin from './plugins/metrics.js'
import listingsRoute from './routes/listings.js'
import alertsRoute from './routes/alerts.js'
import usersRoute from './routes/users.js'
import vehicleRoute from './routes/vehicle.js'
import adminRoute from './routes/admin.js'

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
})

await app.register(helmet)
await app.register(cors, { origin: process.env.CORS_ORIGIN ?? true })
await app.register(sensible)
await app.register(prismaPlugin)
await app.register(metricsPlugin)
await app.register(listingsRoute, { prefix: '/api/v1' })
await app.register(alertsRoute, { prefix: '/api/v1' })
await app.register(usersRoute, { prefix: '/api/v1' })
await app.register(vehicleRoute, { prefix: '/api/v1' })
await app.register(adminRoute,  { prefix: '/api/v1' })

app.get('/health', async () => ({
  status: 'ok',
  db: await app.prisma.$queryRaw`SELECT 1`.then(() => 'ok').catch(() => 'error'),
  uptime: process.uptime(),
}))

const shutdown = async () => {
  await app.close()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

try {
  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
