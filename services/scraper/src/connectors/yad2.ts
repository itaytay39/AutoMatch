import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { newStealthContext, randomDelay } from '../core/browser.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

// yad2 — two strategies:
//   1. Apify actor (preferred, requires APIFY_TOKEN)
//   2. Playwright stealth (fallback, may be blocked)

const APIFY_TOKEN = process.env.APIFY_TOKEN
const APIFY_ACTOR = 'apify/yad2-scraper'

async function scrapeViaApify(criteria: SearchCriteria): Promise<Listing[]> {
  const input = {
    searchType: 'cars',
    manufacturer: criteria.make ?? '',
    model:        criteria.model ?? '',
    yearFrom:     criteria.yearMin ?? '',
    priceTo:      criteria.maxPrice ?? '',
    kmTo:         criteria.maxKm ?? '',
    maxItems:     40,
  }

  // Start actor run
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${APIFY_ACTOR}/runs?token=${APIFY_TOKEN}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input }) }
  )
  const { data: runData } = await runRes.json() as any
  const runId = runData?.id
  if (!runId) throw new Error('Apify: no run id')

  // Poll until done (max 90s)
  for (let i = 0; i < 18; i++) {
    await new Promise(r => setTimeout(r, 5_000))
    const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`)
    const { data: st } = await statusRes.json() as any
    if (st?.status === 'SUCCEEDED') break
    if (st?.status === 'FAILED' || st?.status === 'ABORTED') throw new Error(`Apify run ${st.status}`)
  }

  // Fetch dataset
  const dsRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&limit=40`
  )
  const items = await dsRes.json() as any[]

  return items.map(item => ({
    externalId:  String(item.id ?? item.adId ?? ''),
    source:      'yad2',
    url:         item.url ?? `https://www.yad2.co.il/item/${item.id}`,
    title:       `${item.manufacturer ?? ''} ${item.model ?? ''}`.trim(),
    make:        normalizeMake(item.manufacturer ?? ''),
    model:       item.model ?? '',
    year:        normalizeYear(String(item.year ?? '')),
    mileage:     normalizeMileage(String(item.km ?? '')),
    price:       normalizePrice(String(item.price ?? '')),
    city:        normalizeCity(item.city ?? ''),
    images:      item.images ?? (item.image ? [item.image] : []),
    description: item.description ?? null,
  })).filter(l => l.images.length > 0 && l.price > 0)
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
        externalId: item.id,
        source:     'yad2',
        url:        item.href || `https://www.yad2.co.il/item/${item.id}`,
        title:      item.title,
        make:       normalizeMake(make),
        model:      modelParts.join(' '),
        year:       normalizeYear(item.year),
        mileage:    normalizeMileage(item.km),
        price:      normalizePrice(item.price),
        city:       normalizeCity(item.city),
        images:     item.img ? [item.img] : [],
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
    if (APIFY_TOKEN) {
      try {
        console.log('[yad2] using Apify actor')
        return await scrapeViaApify(criteria)
      } catch (err: any) {
        console.warn('[yad2] Apify failed, falling back to Playwright:', err.message)
      }
    }
    return scrapeViaPlaywright(criteria)
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
