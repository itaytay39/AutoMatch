import { PrismaClient } from '@prisma/client'
import { sendPush } from './firebase.js'

const prisma = new PrismaClient()

interface NewListing {
  id: string
  make: string
  model: string
  year: number
  mileage?: number
  price: number
  city?: string
  source: string
}

// Called after every scrape batch — checks all user alerts against new listings
export async function matchAndNotify(newListings: NewListing[]) {
  const alerts = await prisma.alert.findMany({ include: { user: true } })

  for (const listing of newListings) {
    for (const alert of alerts) {
      if (!matchesAlert(listing, alert)) continue
      const user = alert.user
      if (!user.fcmToken) continue

      const price = listing.price.toLocaleString('he-IL')
      const title = `🚗 ${listing.make} ${listing.model} ${listing.year}`
      const body = `₪ ${price} · ${listing.city ?? ''} · ${listing.source}`

      await sendPush(user.fcmToken, title, body, {
        listingId: listing.id,
        type: 'new_listing',
      }).catch(err => console.error(`FCM error for user ${user.id}:`, err.message))
    }
  }
}

export async function notifyPriceDrop(listingId: string, oldPrice: number, newPrice: number) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) return

  const alerts = await prisma.alert.findMany({
    where: {
      make: listing.make ? { equals: listing.make } : undefined,
      OR: [{ maxPrice: null }, { maxPrice: { gte: newPrice } }],
    },
    include: { user: true },
  })

  const drop = Math.round(((oldPrice - newPrice) / oldPrice) * 100)
  const tokens = alerts.map(a => a.user.fcmToken).filter(Boolean) as string[]
  if (!tokens.length) return

  const title = `ירידת מחיר — ${listing.make} ${listing.model}`
  const body = `ירד ב-${drop}% · עכשיו ₪ ${newPrice.toLocaleString('he-IL')}`

  const { sendMulticast } = await import('./firebase.js')
  await sendMulticast(tokens, title, body, { listingId, type: 'price_drop', drop: String(drop) })
}

function matchesAlert(listing: NewListing, alert: { make?: string | null; model?: string | null; yearMin?: number | null; yearMax?: number | null; maxPrice?: number | null; maxKm?: number | null; city?: string | null }) {
  if (alert.make && listing.make.toLowerCase() !== alert.make.toLowerCase()) return false
  if (alert.model && !listing.model.toLowerCase().includes(alert.model.toLowerCase())) return false
  if (alert.yearMin && listing.year < alert.yearMin) return false
  if (alert.yearMax && listing.year > alert.yearMax) return false
  if (alert.maxPrice && listing.price > alert.maxPrice) return false
  if (alert.maxKm && listing.mileage && listing.mileage > alert.maxKm) return false
  if (alert.city && listing.city && !listing.city.includes(alert.city)) return false
  return true
}
