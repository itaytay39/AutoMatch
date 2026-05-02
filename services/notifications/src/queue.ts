import { Queue, Worker, Job } from 'bullmq'
import { matchAndNotify } from './alertMatcher.js'
import { detectPriceDrops } from './priceWatcher.js'

const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 }

export const notifQueue = new Queue('notifications', { connection })

export interface NotifJob {
  type: 'new_listings' | 'price_drops'
  listings: Array<{ id: string; make: string; model: string; year: number; mileage?: number; price: number; city?: string; source: string }>
}

export function startNotifWorker() {
  const worker = new Worker<NotifJob>(
    'notifications',
    async (job: Job<NotifJob>) => {
      if (job.data.type === 'new_listings') {
        await matchAndNotify(job.data.listings)
      } else {
        await detectPriceDrops(job.data.listings.map(l => ({ id: l.id, price: l.price })))
      }
    },
    { connection, concurrency: 5 }
  )

  worker.on('failed', (job, err) => console.error(`[notif] job ${job?.id} failed:`, err.message))
  return worker
}

export async function enqueueNewListings(listings: NotifJob['listings']) {
  if (!listings.length) return
  await notifQueue.add('new_listings', { type: 'new_listings', listings }, { attempts: 2 })
}

export async function enqueuePriceDrops(listings: NotifJob['listings']) {
  if (!listings.length) return
  await notifQueue.add('price_drops', { type: 'price_drops', listings }, { attempts: 2 })
}
