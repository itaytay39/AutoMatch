import { Queue, Worker, Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import { ALL_CONNECTORS } from '../connectors/index.js'
import { deduplicateListings } from './deduplicator.js'
import { SearchCriteria, Listing } from './types.js'

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
          return [] as Listing[]
        }))
      )

      const listings = allResults.flatMap(r => r.status === 'fulfilled' ? r.value : [])
      const deduped = deduplicateListings(listings)

      const newListings: typeof deduped = []
      const updatedListings: typeof deduped = []

      for (const listing of deduped) {
        if (!listing.price || listing.year < 1990) continue
        try {
          const existing = await prisma.listing.findUnique({
            where: { source_externalId: { source: listing.source, externalId: listing.externalId } },
          })
          const saved = await prisma.listing.upsert({
            where: { source_externalId: { source: listing.source, externalId: listing.externalId } },
            create: listing,
            update: { price: listing.price, mileage: listing.mileage, images: listing.images },
          })
          await prisma.priceSnapshot.create({ data: { listingId: saved.id, price: listing.price } })

          const enriched = { ...listing, id: saved.id }
          if (!existing) newListings.push(enriched)
          else updatedListings.push(enriched)
        } catch (e) {
          console.error('DB upsert error:', e)
        }
      }

      // Enqueue notifications via separate service (decoupled via Redis queue)
      const notifQueue = new Queue('notifications', { connection })
      await Promise.allSettled([
        newListings.length && notifQueue.add('new_listings', { type: 'new_listings', listings: newListings }),
        updatedListings.length && notifQueue.add('price_drops', { type: 'price_drops', listings: updatedListings }),
      ])

      return { scraped: listings.length, saved: deduped.length, new: newListings.length }
    },
    { connection, concurrency: 3 }
  )

  worker.on('completed', (job) => {
    const r = job.returnvalue
    console.log(`✓ scrape #${job.id} — scraped ${r?.scraped}, saved ${r?.saved}, new ${r?.new}`)
  })
  worker.on('failed', (job, err) => console.error(`✗ scrape job ${job?.id} failed:`, err.message))

  return worker
}

export async function startCron() {
  await scrapeQueue.add('cron-scrape', {}, {
    repeat: { pattern: '0 */2 * * *' },
    attempts: 2,
  })
  console.log('Scrape cron scheduled every 2 hours')
}
