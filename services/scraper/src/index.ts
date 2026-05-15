import { startWorker, startCron } from './core/scheduler.js'
import { ALL_CONNECTORS } from './connectors/index.js'
import Fastify from 'fastify'

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? 'automatch-dev'

// Lightweight HTTP server for diagnostics
const app = Fastify({ logger: false })

app.addHook('preHandler', async (req, reply) => {
  const auth = req.headers['x-admin-secret']
  if (auth !== ADMIN_SECRET) return reply.code(401).send({ error: 'unauthorized' })
})

// Test all connectors with a given make/model and return per-source stats
app.get('/test', async (req) => {
  const { make = '', model = '', yearMin = '' } = req.query as Record<string, string>
  const criteria = {
    make:    make || undefined,
    model:   model || undefined,
    yearMin: yearMin ? parseInt(yearMin, 10) : undefined,
  }

  const results = await Promise.allSettled(
    ALL_CONNECTORS.map(async c => {
      const start = Date.now()
      try {
        const listings = await c.search(criteria)
        return { source: c.name, ok: true, count: listings.length, ms: Date.now() - start, sample: listings[0] ?? null }
      } catch (err: any) {
        return { source: c.name, ok: false, count: 0, ms: Date.now() - start, error: err.message }
      }
    })
  )

  const rows = results.map(r => r.status === 'fulfilled' ? r.value : { source: '?', ok: false, count: 0, ms: 0, error: 'rejected' })
  const working  = rows.filter(r => r.ok && r.count > 0).length
  const empty    = rows.filter(r => r.ok && r.count === 0).length
  const failed   = rows.filter(r => !r.ok).length

  return { summary: { total: rows.length, working, empty, failed }, connectors: rows }
})

app.listen({ port: Number(process.env.SCRAPER_PORT ?? 3001), host: '0.0.0.0' })
  .then(() => console.log('Scraper diagnostics on :3001/test'))
  .catch(() => {}) // non-fatal if port busy

console.log('Starting scraper worker...')
startWorker()
await startCron()
console.log('Scraper ready — waiting for jobs')
