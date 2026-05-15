import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { makePlaywrightConnector } from './_playwrightBase.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

// autoboom.co.il — major used-car marketplace
// Strategy 1: internal JSON API (same pattern as yad2)
// Strategy 2: Playwright __NEXT_DATA__ fallback

const HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8',
  'Referer': 'https://www.autoboom.co.il/',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
}

async function scrapeViaAPI(criteria: SearchCriteria): Promise<Listing[]> {
  const params = new URLSearchParams()
  if (criteria.make)     params.set('manufacturer', criteria.make)
  if (criteria.model)    params.set('model',         criteria.model)
  if (criteria.yearMin)  params.set('year_from',     String(criteria.yearMin))
  if (criteria.maxPrice) params.set('price_to',      String(criteria.maxPrice))
  if (criteria.maxKm)    params.set('km_to',         String(criteria.maxKm))
  params.set('rows', '40')
  params.set('page', '1')

  // Try several possible API endpoints
  const endpoints = [
    `https://www.autoboom.co.il/api/search/cars?${params}`,
    `https://api.autoboom.co.il/v1/cars/search?${params}`,
    `https://www.autoboom.co.il/s/private/cars.json?${params}`,
  ]

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) })
      if (!res.ok) continue
      const json = await res.json() as any
      const items: any[] = json?.data ?? json?.cars ?? json?.listings ?? json?.items ?? []
      if (items.length === 0) continue

      return items
        .filter((item: any) => item.id || item.carId)
        .map((item: any) => {
          const imgs: string[] = item.images ?? (item.mainImage ? [item.mainImage] : [])
          return {
            externalId: String(item.id ?? item.carId ?? item.vehicleId),
            source:     'autoboom',
            url:        item.url ?? item.link
              ? (item.url ?? item.link).startsWith('http') ? (item.url ?? item.link) : `https://www.autoboom.co.il${item.url ?? item.link}`
              : `https://www.autoboom.co.il/item/${item.id ?? item.carId}`,
            title:      `${item.manufacturer ?? item.make ?? ''} ${item.model ?? ''}`.trim(),
            make:       normalizeMake(item.manufacturer ?? item.make ?? ''),
            model:      item.model ?? '',
            year:       normalizeYear(String(item.year ?? '')),
            mileage:    normalizeMileage(String(item.km ?? item.mileage ?? '')),
            price:      normalizePrice(String(item.price ?? '')),
            city:       normalizeCity(item.city ?? item.area ?? ''),
            images:     imgs,
            hand:       item.hand ? parseInt(String(item.hand), 10) || undefined : undefined,
            fuelType:   item.fuelType ?? item.fuel ?? undefined,
          }
        })
        .filter((l: Listing) => l.images.length > 0 && l.price > 0)
    } catch { continue }
  }
  throw new Error('all autoboom API endpoints failed')
}

const playwrightFallback = makePlaywrightConnector({
  name: 'autoboom',
  baseUrl: 'https://www.autoboom.co.il',
  buildUrl: (c: SearchCriteria) => {
    const q = new URLSearchParams()
    if (c.make)     q.set('manufacturer', c.make)
    if (c.model)    q.set('model',        c.model)
    if (c.yearMin)  q.set('yearFrom',     String(c.yearMin))
    if (c.maxPrice) q.set('priceTo',      String(c.maxPrice))
    if (c.maxKm)    q.set('kmTo',         String(c.maxKm))
    const qs = q.toString()
    return `https://www.autoboom.co.il/s/private/cars${qs ? '?' + qs : ''}`
  },
  waitSelector: '[data-item-id], [class*="FeedItem"], [class*="feed-item"]',
  extractItems: async (page) => {
    // Try __NEXT_DATA__ first
    const nextData = await page.evaluate(() => {
      const el = document.getElementById('__NEXT_DATA__')
      if (!el) return null
      try { return JSON.parse(el.textContent ?? '') } catch { return null }
    })
    if (nextData) {
      const cars: any[] =
        nextData?.props?.pageProps?.feed?.cars ??
        nextData?.props?.pageProps?.cars ??
        nextData?.props?.pageProps?.listings ?? []
      if (cars.length > 0) {
        return cars.slice(0, 40).map((v: any) => ({
          id:    String(v.id ?? v.carId ?? ''),
          title: `${v.manufacturer ?? v.make ?? ''} ${v.model ?? ''}`.trim(),
          price: String(v.price ?? ''),
          year:  String(v.year ?? ''),
          km:    String(v.km ?? v.mileage ?? ''),
          city:  String(v.city ?? v.area ?? ''),
          img:   v.mainImage ?? v.images?.[0] ?? v.image ?? '',
          href:  v.url ?? v.link ?? `/item/${v.id}`,
        }))
      }
    }

    return page.$$eval(
      '[data-item-id], [class*="FeedItem"]:not(header), [class*="feed-item"]:not(header), article',
      (els) => els.slice(0, 40).map(el => {
        const a   = el.querySelector('a[href*="/item/"], a[href*="/ad/"], a') as HTMLAnchorElement | null
        const img = el.querySelector('img') as HTMLImageElement | null
        return {
          id:    el.getAttribute('data-item-id') ?? el.getAttribute('data-id') ?? a?.href ?? '',
          title: (el.querySelector('[class*="title"], [class*="Title"], h2, h3') as HTMLElement | null)?.innerText?.trim() ?? '',
          price: (el.querySelector('[class*="price"], [class*="Price"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          year:  (el.querySelector('[class*="year"], [class*="Year"]')  as HTMLElement | null)?.innerText?.trim() ?? '',
          km:    (el.querySelector('[class*="km"], [class*="Km"], [class*="mileage"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          city:  (el.querySelector('[class*="city"], [class*="City"], [class*="location"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          img:   img?.src ?? img?.getAttribute('data-src') ?? '',
          href:  a?.href ?? '',
        }
      })
    )
  },
})

export const autoboomConnector: CarConnector = {
  name: 'autoboom',
  baseUrl: 'https://www.autoboom.co.il',

  async search(criteria: SearchCriteria): Promise<Listing[]> {
    try {
      return await scrapeViaAPI(criteria)
    } catch (err: any) {
      console.warn('[autoboom] API failed, falling back to Playwright:', err.message)
      return playwrightFallback.search(criteria)
    }
  },

  async fetchDetails(url: string): Promise<Partial<Listing>> {
    return playwrightFallback.fetchDetails(url)
  },
}
