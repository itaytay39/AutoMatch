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

  // Seed ~20 realistic Israeli used car listings
  app.post('/admin/seed', async (_req, reply) => {
    const existing = await app.prisma.listing.findFirst({
      where: { externalId: { startsWith: 'seed-' } },
    })
    if (existing) {
      return reply.code(200).send({ seeded: 0, message: 'already seeded' })
    }

    const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800'

    const listings = [
      { externalId: 'seed-1',  source: 'yad2',    make: 'Toyota',     model: 'Corolla Hybrid',  year: 2021, price: 115000, mileage: 32000,  city: 'תל אביב',       hand: 1, daysOnLot: 3  },
      { externalId: 'seed-2',  source: 'autoboom', make: 'Hyundai',    model: 'Tucson',           year: 2020, price: 98000,  mileage: 55000,  city: 'חיפה',          hand: 2, daysOnLot: 7  },
      { externalId: 'seed-3',  source: 'homeless', make: 'Kia',        model: 'Stonic',           year: 2019, price: 72000,  mileage: 78000,  city: 'ירושלים',       hand: 2, daysOnLot: 1  },
      { externalId: 'seed-4',  source: 'yad2',    make: 'Mazda',      model: '3',                year: 2022, price: 130000, mileage: 18000,  city: 'ראשון לציון',   hand: 1, daysOnLot: 0  },
      { externalId: 'seed-5',  source: 'autoboom', make: 'Honda',      model: 'Civic',            year: 2020, price: 105000, mileage: 44000,  city: 'פתח תקווה',     hand: 1, daysOnLot: 5  },
      { externalId: 'seed-6',  source: 'homeless', make: 'Volkswagen', model: 'Golf',             year: 2018, price: 68000,  mileage: 92000,  city: 'נתניה',         hand: 2, daysOnLot: 12 },
      { externalId: 'seed-7',  source: 'yad2',    make: 'Skoda',      model: 'Octavia',          year: 2021, price: 112000, mileage: 29000,  city: 'אשדוד',         hand: 1, daysOnLot: 2  },
      { externalId: 'seed-8',  source: 'autoboom', make: 'Mitsubishi', model: 'Eclipse Cross',    year: 2022, price: 148000, mileage: 14000,  city: 'באר שבע',       hand: 1, daysOnLot: 0  },
      { externalId: 'seed-9',  source: 'homeless', make: 'Toyota',     model: 'Corolla Hybrid',  year: 2019, price: 87000,  mileage: 66000,  city: 'תל אביב',       hand: 2, daysOnLot: 9  },
      { externalId: 'seed-10', source: 'yad2',    make: 'Hyundai',    model: 'Tucson',           year: 2023, price: 165000, mileage: 8000,   city: 'חיפה',          hand: 1, daysOnLot: 1  },
      { externalId: 'seed-11', source: 'autoboom', make: 'Kia',        model: 'Stonic',           year: 2021, price: 95000,  mileage: 37000,  city: 'ירושלים',       hand: 1, daysOnLot: 4  },
      { externalId: 'seed-12', source: 'homeless', make: 'Mazda',      model: '3',                year: 2020, price: 102000, mileage: 48000,  city: 'ראשון לציון',   hand: 2, daysOnLot: 6  },
      { externalId: 'seed-13', source: 'yad2',    make: 'Honda',      model: 'Civic',            year: 2018, price: 63000,  mileage: 105000, city: 'פתח תקווה',     hand: 2, daysOnLot: 15 },
      { externalId: 'seed-14', source: 'autoboom', make: 'Volkswagen', model: 'Golf',             year: 2022, price: 138000, mileage: 22000,  city: 'נתניה',         hand: 1, daysOnLot: 0  },
      { externalId: 'seed-15', source: 'homeless', make: 'Skoda',      model: 'Octavia',          year: 2019, price: 76000,  mileage: 84000,  city: 'אשדוד',         hand: 2, daysOnLot: 8  },
      { externalId: 'seed-16', source: 'yad2',    make: 'Mitsubishi', model: 'Eclipse Cross',    year: 2020, price: 118000, mileage: 51000,  city: 'באר שבע',       hand: 1, daysOnLot: 3  },
      { externalId: 'seed-17', source: 'autoboom', make: 'Toyota',     model: 'Corolla Hybrid',  year: 2022, price: 142000, mileage: 19000,  city: 'תל אביב',       hand: 1, daysOnLot: 1  },
      { externalId: 'seed-18', source: 'homeless', make: 'Hyundai',    model: 'Tucson',           year: 2018, price: 61000,  mileage: 118000, city: 'חיפה',          hand: 2, daysOnLot: 20 },
      { externalId: 'seed-19', source: 'yad2',    make: 'Kia',        model: 'Stonic',           year: 2023, price: 158000, mileage: 6000,   city: 'ירושלים',       hand: 1, daysOnLot: 0  },
      { externalId: 'seed-20', source: 'autoboom', make: 'Mazda',      model: '3',                year: 2021, price: 109000, mileage: 40000,  city: 'ראשון לציון',   hand: 1, daysOnLot: 2  },
    ]

    const data = listings.map(l => ({
      externalId:  l.externalId,
      source:      l.source,
      url:         `https://${l.source}.co.il/listings/${l.externalId}`,
      title:       `${l.make} ${l.model} ${l.year}`,
      make:        l.make,
      model:       l.model,
      year:        l.year,
      price:       l.price,
      mileage:     l.mileage,
      city:        l.city,
      hand:        l.hand,
      daysOnLot:   l.daysOnLot,
      images:      [PLACEHOLDER_IMAGE],
      fuelType:    l.model === 'Corolla Hybrid' ? 'היברידי' : 'בנזין',
    }))

    const { count } = await app.prisma.listing.createMany({ data, skipDuplicates: true })
    return { seeded: count }
  })

  // Delete only mock/seed listings (externalId not a real numeric ID)
  app.delete('/admin/listings/mock', async (req, reply) => {
    const { confirm } = (req.query as any)
    if (confirm !== 'yes') return reply.code(400).send({ error: 'add ?confirm=yes' })
    // Mock listings have externalId like "stonic-4", "corona-1" etc (non-numeric)
    const all = await app.prisma.listing.findMany({ select: { id: true, externalId: true } })
    const mockIds = all
      .filter(l => !/^\d+$/.test(l.externalId))
      .map(l => l.id)
    if (mockIds.length === 0) return { deleted: 0, message: 'no mock listings found' }
    const { count } = await app.prisma.listing.deleteMany({ where: { id: { in: mockIds } } })
    return { deleted: count }
  })
}

export default admin
