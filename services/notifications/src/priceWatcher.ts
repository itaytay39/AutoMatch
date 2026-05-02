import { PrismaClient } from '@prisma/client'
import { notifyPriceDrop } from './alertMatcher.js'

const prisma = new PrismaClient()

// Run after each scrape — detect price drops vs last snapshot
export async function detectPriceDrops(updatedListings: Array<{ id: string; price: number }>) {
  for (const { id, price: newPrice } of updatedListings) {
    const lastSnapshot = await prisma.priceSnapshot.findFirst({
      where: { listingId: id },
      orderBy: { date: 'desc' },
      skip: 1, // skip the snapshot we just created
    })
    if (!lastSnapshot) continue

    const oldPrice = lastSnapshot.price
    const dropPct = (oldPrice - newPrice) / oldPrice

    // Notify on drops >= 3%
    if (dropPct >= 0.03) {
      await notifyPriceDrop(id, oldPrice, newPrice)
    }
  }
}
