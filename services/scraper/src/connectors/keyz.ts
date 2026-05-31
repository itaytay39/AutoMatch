import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { makePlaywrightConnector } from './_playwrightBase.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

// keyz.ai — new Israeli marketplace (launched March 2026), cars + real estate
// Strategy 1: internal JSON API (Next.js / REST patterns)
// Strategy 2: Playwright __NEXT_DATA__ / DOM fallback

const HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8',
  'Referer': 'https://keyz.ai/',
  'Origin': 'https://keyz.ai',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
}

async function scrapeViaAPI(criteria: SearchCriteria): Promise<Listing[]> {
  const params = new URLSearchParams()
  if (criteria.make)     params.set('manufacturer', criteria.make)
  if (criteria.model)    params.set('model',         criteria.model)
  if (criteria.yearMin)  params.set('year_from',     String(criteria.yearMin))
  if (criteria.yearMax)  params.set('year_to',       String(criteria.yearMax))
  if (criteria.maxPrice) params.set('price_to',      String(criteria.maxPrice))
  if (criteria.maxKm)    params.set('km_to',         String(criteria.maxKm))
  if (criteria.city)     params.set('city',          criteria.city)
  params.set('category', 'cars')
  params.set('limit', '40')
  params.set('page', '1')

  const endpoints = [
    `https://keyz.ai/api/listings/search?${params}`,
    `https://keyz.ai/api/cars/search?${params}`,
    `https://keyz.ai/api/v1/listings?${params}`,
    `https://keyz.ai/_next/data/cars.json?${params}`,
  ]

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) })
      if (!res.ok) continue
      const json = await res.json() as any
      const items: any[] =
        json?.data?.listings ?? json?.listings ?? json?.cars ??
        json?.data?.cars ?? json?.items ?? json?.data ?? []
      if (!Array.isArray(items) || items.length === 0) continue

      return items
        .filter((item: any) => item.id ?? item.listingId)
        .map((item: any) => {
          const imgs: string[] =
            item.images ??
            (item.mainImage ? [item.mainImage] : item.thumbnail ? [item.thumbnail] : [])
          return {
            externalId: String(item.id ?? item.listingId ?? item.vehicleId),
            source:     'keyz',
            url:        item.url ?? item.link
              ? String(item.url ?? item.link).startsWith('http')
                ? String(item.url ?? item.link)
                : `https://keyz.ai${item.url ?? item.link}`
              : `https://keyz.ai/listing/${item.id ?? item.listingId}`,
            title:      `${item.manufacturer ?? item.make ?? item.brand ?? ''} ${item.model ?? ''}`.trim(),
            make:       normalizeMake(item.manufacturer ?? item.make ?? item.brand ?? ''),
            model:      item.model ?? '',
            year:       normalizeYear(String(item.year ?? '')),
            mileage:    normalizeMileage(String(item.km ?? item.mileage ?? item.odometer ?? '')),
            price:      normalizePrice(String(item.price ?? '')),
            city:       normalizeCity(item.city ?? item.location ?? item.area ?? ''),
            images:     imgs,
            description: item.description ?? item.info ?? undefined,
            hand:       item.hand ? parseInt(String(item.hand), 10) || undefined : undefined,
            trim:       item.trim ?? item.trimLevel ?? undefined,
            fuelType:   item.fuelType ?? item.fuel ?? undefined,
            seller:     item.sellerName ?? item.contactName ?? item.agencyName ?? undefined,
          }
        })
        .filter((l: Listing) => l.images.length > 0 && l.price > 0)
    } catch { continue }
  }
  throw new Error('all keyz.ai API endpoints failed')
}

const playwrightFallback = makePlaywrightConnector({
  name: 'keyz',
  baseUrl: 'https://keyz.ai',
  buildUrl: (c: SearchCriteria) => {
    const q = new URLSearchParams()
    if (c.make)     q.set('manufacturer', c.make)
    if (c.model)    q.set('model',        c.model)
    if (c.yearMin)  q.set('yearFrom',     String(c.yearMin))
    if (c.maxPrice) q.set('priceTo',      String(c.maxPrice))
    if (c.maxKm)    q.set('kmTo',         String(c.maxKm))
    const qs = q.toString()
    return `https://keyz.ai/cars${qs ? '?' + qs : ''}`
  },
  waitSelector: '[data-listing-id], [class*="ListingCard"], [class*="listing-card"], [class*="VehicleCard"], article',
  extractItems: async (page) => {
    const nextData = await page.evaluate(() => {
      const el = document.getElementById('__NEXT_DATA__')
      if (!el) return null
      try { return JSON.parse(el.textContent ?? '') } catch { return null }
    })
    if (nextData) {
      const listings: any[] =
        nextData?.props?.pageProps?.listings ??
        nextData?.props?.pageProps?.cars ??
        nextData?.props?.pageProps?.data?.listings ?? []
      if (listings.length > 0) {
        return listings.slice(0, 40).map((v: any) => ({
          id:    String(v.id ?? v.listingId ?? ''),
          title: `${v.manufacturer ?? v.make ?? v.brand ?? ''} ${v.model ?? ''}`.trim(),
          price: String(v.price ?? ''),
          year:  String(v.year ?? ''),
          km:    String(v.km ?? v.mileage ?? ''),
          city:  String(v.city ?? v.location ?? ''),
          img:   v.mainImage ?? v.images?.[0] ?? v.thumbnail ?? '',
          href:  v.url ?? v.link ?? `/listing/${v.id}`,
        }))
      }
    }

    return page.$$eval(
      '[data-listing-id], [class*="ListingCard"]:not(header), [class*="listing-card"]:not(header), [class*="VehicleCard"]:not(header), article',
      (els) => els.slice(0, 40).map(el => {
        const a   = el.querySelector('a[href*="/listing/"], a[href*="/car/"], a[href*="/vehicle/"], a') as HTMLAnchorElement | null
        const img = el.querySelector('img') as HTMLImageElement | null
        return {
          id:    el.getAttribute('data-listing-id') ?? el.getAttribute('data-id') ?? a?.href ?? '',
          title: (el.querySelector('[class*="title"], [class*="Title"], [class*="name"], h2, h3') as HTMLElement | null)?.innerText?.trim() ?? '',
          price: (el.querySelector('[class*="price"], [class*="Price"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          year:  (el.querySelector('[class*="year"], [class*="Year"]')  as HTMLElement | null)?.innerText?.trim() ?? '',
          km:    (el.querySelector('[class*="km"], [class*="mileage"], [class*="odometer"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          city:  (el.querySelector('[class*="city"], [class*="location"], [class*="area"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          img:   img?.src ?? img?.getAttribute('data-src') ?? '',
          href:  a?.href ?? '',
        }
      })
    )
  },
})

export const keyzConnector: CarConnector = {
  name: 'keyz',
  baseUrl: 'https://keyz.ai',

  async search(criteria: SearchCriteria): Promise<Listing[]> {
    try {
      return await scrapeViaAPI(criteria)
    } catch (err: any) {
      console.warn('[keyz] API failed, falling back to Playwright:', err.message)
      return playwrightFallback.search(criteria)
    }
  },

  async fetchDetails(url: string): Promise<Partial<Listing>> {
    return playwrightFallback.fetchDetails(url)
  },
}
