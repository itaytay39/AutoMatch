import { Listing } from './types.js'

// Two listings are the same car if make+model+year+mileage match within tolerance
export function deduplicateListings(listings: Listing[]): Listing[] {
  const seen = new Map<string, Listing>()

  for (const listing of listings) {
    const key = buildKey(listing)
    if (!seen.has(key)) {
      seen.set(key, listing)
    } else {
      // Keep the listing with more images or lower price
      const existing = seen.get(key)!
      if (listing.images.length > existing.images.length || listing.price < existing.price) {
        seen.set(key, { ...existing, ...listing, images: [...new Set([...existing.images, ...listing.images])] })
      }
    }
  }

  return Array.from(seen.values())
}

function buildKey(l: Listing): string {
  const km = l.mileage ? Math.round(l.mileage / 5000) * 5000 : 'unknown'
  return `${l.make}|${l.model}|${l.year}|${km}`
}
