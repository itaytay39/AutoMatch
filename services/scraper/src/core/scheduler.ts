import { Queue, Worker, Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import { ALL_CONNECTORS } from '../connectors/index.js'
import { deduplicateListings } from './deduplicator.js'
import { SearchCriteria, Listing } from './types.js'

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : { host: process.env.REDIS_HOST ?? 'localhost', port: Number(process.env.REDIS_PORT ?? 6379) }

const prisma = new PrismaClient()

export const scrapeQueue = new Queue('scrape', { connection })

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)
    ),
  ])

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
      console.log(`[scraper] job #${job.id} starting — criteria:`, JSON.stringify(criteria))

      const perConnector = await Promise.allSettled(
        ALL_CONNECTORS.map(async c => {
          const start = Date.now()
          try {
            const results = await withTimeout(c.search(criteria), 30_000)
            const ms = Date.now() - start
            if (results.length > 0) {
              console.log(`[${c.name}] ✓ ${results.length} listings (${ms}ms)`)
            } else {
              console.log(`[${c.name}] ○ 0 listings (${ms}ms)`)
            }
            return results
          } catch (err: any) {
            console.error(`[${c.name}] ✗ ${err.message} (${Date.now() - start}ms)`)
            return [] as Listing[]
          }
        })
      )

      const listings = perConnector.flatMap(r => r.status === 'fulfilled' ? r.value : [])
      console.log(`[scraper] total raw: ${listings.length}, deduplicating...`)
      const deduped = deduplicateListings(listings)
      console.log(`[scraper] after dedup: ${deduped.length}`)

      const newListings: typeof deduped = []
      const updatedListings: typeof deduped = []

      for (const listing of deduped) {
        if (!listing.price || listing.year < 1990) continue
        try {
          const existing = await prisma.listing.findUnique({
            where: { source_externalId: { source: listing.source, externalId: listing.externalId } },
          })
          const createData = {
            externalId:  listing.externalId,
            source:      listing.source,
            url:         listing.url,
            title:       listing.title,
            make:        listing.make,
            model:       listing.model,
            year:        listing.year,
            price:       listing.price,
            mileage:     listing.mileage,
            city:        listing.city,
            description: listing.description,
            images:      listing.images,
            plate:       listing.plate,
            hand:        listing.hand,
            trim:        listing.trim,
            engine:      listing.engine,
            fuelType:    listing.fuelType,
            seller:      listing.seller,
            region:      listing.region,
            daysOnLot:   listing.daysOnLot,
          }
          const saved = await prisma.listing.upsert({
            where: { source_externalId: { source: listing.source, externalId: listing.externalId } },
            create: createData,
            update: {
              price:     listing.price,
              mileage:   listing.mileage,
              images:    listing.images,
              daysOnLot: listing.daysOnLot,
              plate:     listing.plate ?? undefined,
              hand:      listing.hand ?? undefined,
              trim:      listing.trim ?? undefined,
              engine:    listing.engine ?? undefined,
              fuelType:  listing.fuelType ?? undefined,
              seller:    listing.seller ?? undefined,
              region:    listing.region ?? undefined,
            },
          })
          await prisma.priceSnapshot.create({ data: { listingId: saved.id, price: listing.price } })

          const enriched = { ...listing, id: saved.id }
          if (!existing) newListings.push(enriched)
          else updatedListings.push(enriched)
        } catch (e: any) {
          console.error(`[scraper] DB upsert error (${listing.source}/${listing.externalId}):`, e.message)
        }
      }

      console.log(`[scraper] job #${job.id} done — new: ${newListings.length}, updated: ${updatedListings.length}`)

      try {
        const notifQueue = new Queue('notifications', { connection })
        await Promise.allSettled([
          newListings.length && notifQueue.add('new_listings', { type: 'new_listings', listings: newListings }),
          updatedListings.length && notifQueue.add('price_drops', { type: 'price_drops', listings: updatedListings }),
        ])
        await notifQueue.close()
      } catch { /* notifications are non-critical */ }

      return { scraped: listings.length, saved: deduped.length, new: newListings.length, updated: updatedListings.length }
    },
    { connection, concurrency: 1 } // 1 job at a time to avoid OOM with Playwright
  )

  worker.on('completed', (job) => {
    const r = job.returnvalue
    console.log(`✓ scrape #${job.id} — raw:${r?.scraped} deduped:${r?.saved} new:${r?.new} updated:${r?.updated}`)
  })
  worker.on('failed', (job, err) => console.error(`✗ scrape job ${job?.id} failed:`, err.message))

  return worker
}

export async function startCron() {
  // Run a scrape immediately on startup so we get data right away
  await scrapeQueue.add('startup-scrape', {}, {
    attempts: 2,
    jobId: 'startup',          // deduped by jobId — won't re-queue if already pending
    removeOnComplete: true,
  })
  console.log('[scraper] startup scrape job queued')

  // Recurring scrape every 2 hours
  await scrapeQueue.add('cron-scrape', {}, {
    repeat: { pattern: '0 */2 * * *' },
    attempts: 2,
  })
  console.log('[scraper] cron scheduled — every 2 hours')
}
