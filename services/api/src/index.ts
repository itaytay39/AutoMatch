import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import prismaPlugin from './plugins/prisma.js'
import listingsRoute from './routes/listings.js'
import alertsRoute from './routes/alerts.js'
import usersRoute from './routes/users.js'

const app = Fastify({ logger: true })

await app.register(helmet)
await app.register(cors, { origin: true })
await app.register(sensible)
await app.register(prismaPlugin)
await app.register(listingsRoute, { prefix: '/api/v1' })
await app.register(alertsRoute, { prefix: '/api/v1' })
await app.register(usersRoute, { prefix: '/api/v1' })

app.get('/health', async () => ({ status: 'ok' }))

try {
  await app.listen({ port: 3000, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
