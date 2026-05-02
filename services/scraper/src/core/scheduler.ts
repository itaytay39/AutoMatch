import { Queue, Worker, Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import { ALL_CONNECTORS } from '../connectors/index.js'
import { deduplicateListings } from './deduplicator.js'
import { SearchCriteria } from './types.js'
import { matchAndNotify, detectPriceDrops } from '@car-aggregator/notifications'

const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 }
const prisma = new PrismaClient()

export const scrapeQueue = new Queue('scrape', { connection })

export async function scheduleScrape(criteria: SearchCriteria) {
  await scrapeQueue.add('scrape-all', criteria, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  })
}

export function startWorker() {
  const worker = new Worker(
    'scrape',
    async (job: Job<SearchCriteria>) => {
      const criteria = job.data
      const allResults = await Promise.allSettled(
        ALL_CONNECTORS.map(c => c.search(criteria).catch(err => {
          console.error(`[${c.name}] error:`, err.message)
          return []
        }))
      )

      const listings = allResults.flatMap(r => r.status === 'fulfilled' ? r.value : [])
      const deduped = deduplicateListings(listings)

      // Upsert into DB
      const savedListings: Array<{ id: string; price: number; isNew: boolean }> = []
      for (const listing of deduped) {
        if (!listing.price || listing.year < 1990) continue
        try {
          const existing = await prisma.listing.findUnique({ where: { source_externalId: { source: listing.source, externalId: listing.externalId } } })
          const saved = await prisma.listing.upsert({
            where: { source_externalId: { source: listing.source, externalId: listing.externalId } },
            create: listing,
            update: { price: listing.price, mileage: listing.mileage, images: listing.images },
          })
          // Record price snapshot
          await prisma.priceSnapshot.create({ data: { listingId: saved.id, price: listing.price } })
          savedListings.push({ id: saved.id, price: listing.price, isNew: !existing })
        } catch (e) {
          console.error('DB upsert error:', e)
        }
      }

      // Fire notifications
      const newListings = savedListings.filter(l => l.isNew)
      const updatedListings = savedListings.filter(l => !l.isNew)
      await Promise.allSettled([
        matchAndNotify(newListings as any),
        detectPriceDrops(updatedListings),
      ])

      return { saved: deduped.length }
    },
    { connection, concurrency: 3 }
  )

  worker.on('completed', job => console.log(`✓ scrape job ${job.id} done — ${job.returnvalue?.saved} listings`))
  worker.on('failed', (job, err) => console.error(`✗ scrape job ${job?.id} failed:`, err.message))

  return worker
}

// Cron: scrape every 2 hours
export async function startCron() {
  await scrapeQueue.add('cron-scrape', {}, {
    repeat: { pattern: '0 */2 * * *' },
    attempts: 2,
  })
  console.log('Scrape cron scheduled every 2 hours')
}
