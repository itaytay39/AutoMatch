import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { Queue } from 'bullmq'

const SCRAPER_QUEUE_URL = process.env.SCRAPER_QUEUE_URL // optional: HTTP endpoint of scraper
const ADMIN_SECRET      = process.env.ADMIN_SECRET ?? 'automatch-dev'

const ScrapeBodySchema = z.object({
  make:     z.string().optional(),
  model:    z.string().optional(),
  yearMin:  z.number().optional(),
  maxPrice: z.number().optional(),
  maxKm:    z.number().optional(),
  city:     z.string().optional(),
  sources:  z.array(z.string()).optional(), // filter to specific connectors
})

const admin: FastifyPluginAsync = async (app) => {
  // Simple bearer token auth for admin routes
  app.addHook('preHandler', async (req, reply) => {
    const auth = req.headers['x-admin-secret'] ?? req.headers.authorization?.replace('Bearer ', '')
    if (auth !== ADMIN_SECRET) {
      return reply.code(401).send({ error: 'unauthorized' })
    }
  })

  // Trigger a scrape job immediately
  app.post('/admin/scrape', async (req, reply) => {
    const body = ScrapeBodySchema.parse(req.body ?? {})

    try {
      const redisUrl = process.env.REDIS_URL
      const connection = redisUrl
        ? { url: redisUrl }
        : {
            host: process.env.REDIS_HOST ?? 'localhost',
            port: Number(process.env.REDIS_PORT ?? 6379),
            connectTimeout: 5000,
            maxRetriesPerRequest: 0,
            enableOfflineQueue: false,
          }
      const scrapeQueue = new Queue('scrape', { connection: connection as any })
      const job = await Promise.race([
        scrapeQueue.add('manual-scrape', body, { attempts: 2 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 6000)),
      ])
      await scrapeQueue.close()
      return { queued: true, jobId: (job as any).id, criteria: body }
    } catch (err: any) {
      app.log.error('Failed to enqueue scrape job:', err.message)
      return reply.code(503).send({ error: 'queue_unavailable', detail: err.message })
    }
  })

  // Stats — how many listings per source
  app.get('/admin/stats', async () => {
    const [total, bySource, recent] = await Promise.all([
      app.prisma.listing.count(),
      app.prisma.listing.groupBy({ by: ['source'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
      app.prisma.listing.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    ])
    return {
      total,
      last24h: recent,
      bySource: bySource.map(r => ({ source: r.source, count: r._count.id })),
    }
  })

  // Clear all listings (for re-seeding)
  app.delete('/admin/listings', async (req, reply) => {
    const { confirm } = (req.query as any)
    if (confirm !== 'yes') return reply.code(400).send({ error: 'add ?confirm=yes' })
    const { count } = await app.prisma.listing.deleteMany()
    return { deleted: count }
  })
}

export default admin
