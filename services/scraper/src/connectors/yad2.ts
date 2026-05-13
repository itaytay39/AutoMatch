import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { newStealthContext, randomDelay } from '../core/browser.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

// yad2 — two strategies:
//   1. Internal JSON API (preferred, no token needed)
//   2. Playwright stealth (fallback)

const GW_BASE = 'https://gw.yad2.co.il/feed-search-legacy/vehicles/cars'

const GW_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8',
  'Referer': 'https://www.yad2.co.il/',
  'Origin': 'https://www.yad2.co.il',
  'mobile-app': 'false',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
}

async function scrapeViaAPI(criteria: SearchCriteria): Promise<Listing[]> {
  const params = new URLSearchParams({ forceLdLoad: 'true' })
  if (criteria.make)     params.set('manufacturer', criteria.make)
  if (criteria.model)    params.set('model',         criteria.model)
  if (criteria.yearMin)  params.set('year',           `${criteria.yearMin}-${criteria.yearMax ?? new Date().getFullYear()}`)
  if (criteria.maxPrice) params.set('price',          `0-${criteria.maxPrice}`)
  if (criteria.maxKm)    params.set('km',             `0-${criteria.maxKm}`)
  params.set('rows', '40')
  params.set('page', '1')

  const res = await fetch(`${GW_BASE}?${params}`, { headers: GW_HEADERS })
  if (!res.ok) throw new Error(`yad2 API ${res.status}`)

  const json = await res.json() as any
  const items: any[] = json?.data?.feed?.feed_items ?? []

  return items
    .filter(item => item.type !== 'ad' && item.id)
    .map(item => {
      const imgs: string[] = []
      if (item.images)        imgs.push(...(item.images as string[]))
      else if (item.main_image) imgs.push(item.main_image)

      return {
        externalId:  String(item.id),
        source:      'yad2',
        url:         item.link_url
          ? `https://www.yad2.co.il${item.link_url}`
          : `https://www.yad2.co.il/item/${item.id}`,
        title:       `${item.manufacturer ?? ''} ${item.model ?? ''}`.trim(),
        make:        normalizeMake(item.manufacturer ?? ''),
        model:       item.model ?? '',
        year:        normalizeYear(String(item.year ?? '')),
        mileage:     normalizeMileage(String(item.Hand_km ?? item.km ?? '')),
        price:       normalizePrice(String(item.price ?? '')),
        city:        normalizeCity(item.city ?? item.area_name ?? ''),
        images:      imgs,
        description: item.info_text ?? null,
      }
    })
    .filter(l => l.images.length > 0 && l.price > 0)
}

async function scrapeViaPlaywright(criteria: SearchCriteria): Promise<Listing[]> {
  const ctx = await newStealthContext()
  const page = await ctx.newPage()
  const listings: Listing[] = []

  try {
    const params = new URLSearchParams()
    if (criteria.make)     params.set('manufacturer', criteria.make)
    if (criteria.model)    params.set('model',         criteria.model)
    if (criteria.yearMin)  params.set('year',           criteria.yearMin.toString())
    if (criteria.maxPrice) params.set('price',          `-${criteria.maxPrice}`)
    if (criteria.maxKm)    params.set('km',             `-${criteria.maxKm}`)

    await page.goto(`https://www.yad2.co.il/vehicles/cars?${params}`, {
      waitUntil: 'domcontentloaded', timeout: 30_000,
    })
    await randomDelay(3_000, 6_000)

    const items = await page.$$eval('[data-testid="feed-item"]', (els) =>
      els.map(el => ({
        id:    el.getAttribute('data-id') ?? '',
        title: el.querySelector('[data-testid="title"]')?.textContent?.trim() ?? '',
        price: el.querySelector('[data-testid="price"]')?.textContent?.trim() ?? '0',
        year:  el.querySelector('[data-testid="year"]')?.textContent?.trim()  ?? '0',
        km:    el.querySelector('[data-testid="km"]')?.textContent?.trim()    ?? '0',
        city:  el.querySelector('[data-testid="city"]')?.textContent?.trim()  ?? '',
        img:   (el.querySelector('img') as HTMLImageElement | null)?.src ?? '',
        href:  (el as HTMLAnchorElement).href ?? '',
      }))
    )

    for (const item of items) {
      if (!item.id || !item.price) continue
      const [make, ...modelParts] = item.title.split(' ')
      listings.push({
        externalId:  item.id,
        source:      'yad2',
        url:         item.href || `https://www.yad2.co.il/item/${item.id}`,
        title:       item.title,
        make:        normalizeMake(make),
        model:       modelParts.join(' '),
        year:        normalizeYear(item.year),
        mileage:     normalizeMileage(item.km),
        price:       normalizePrice(item.price),
        city:        normalizeCity(item.city),
        images:      item.img ? [item.img] : [],
        description: null,
      })
    }
  } finally {
    await ctx.close()
  }

  return listings.filter(l => l.images.length > 0)
}

export const yad2Connector: CarConnector = {
  name: 'yad2',
  baseUrl: 'https://www.yad2.co.il',

  async search(criteria: SearchCriteria): Promise<Listing[]> {
    try {
      console.log('[yad2] using internal JSON API')
      return await scrapeViaAPI(criteria)
    } catch (err: any) {
      console.warn('[yad2] API failed, falling back to Playwright:', err.message)
      return scrapeViaPlaywright(criteria)
    }
  },

  async fetchDetails(url: string): Promise<Partial<Listing>> {
    const ctx = await newStealthContext()
    const page = await ctx.newPage()
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      await randomDelay(2_000, 4_000)
      const images = await page.$$eval(
        'img[data-testid="carousel-image"]',
        imgs => (imgs as HTMLImageElement[]).map(i => i.src)
      )
      const description = await page.$eval(
        '[data-testid="description"]',
        el => el.textContent?.trim() ?? ''
      ).catch(() => '')
      return { images, description }
    } finally {
      await ctx.close()
    }
  },
}
