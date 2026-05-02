import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { newStealthContext, randomDelay } from '../core/browser.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

// yad2 requires Playwright stealth — has strong anti-bot protection
export const yad2Connector: CarConnector = {
  name: 'yad2',
  baseUrl: 'https://www.yad2.co.il',

  async search(criteria: SearchCriteria): Promise<Listing[]> {
    const ctx = await newStealthContext()
    const page = await ctx.newPage()
    const listings: Listing[] = []

    try {
      const params = new URLSearchParams()
      if (criteria.make) params.set('manufacturer', criteria.make)
      if (criteria.model) params.set('model', criteria.model)
      if (criteria.yearMin) params.set('year', criteria.yearMin.toString())
      if (criteria.maxPrice) params.set('price', `-${criteria.maxPrice}`)
      if (criteria.maxKm) params.set('km', `-${criteria.maxKm}`)

      await page.goto(`https://www.yad2.co.il/vehicles/cars?${params}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await randomDelay(3000, 6000)

      const items = await page.$$eval('[data-testid="feed-item"]', (els) =>
        els.map(el => ({
          id: el.getAttribute('data-id') ?? '',
          title: el.querySelector('[data-testid="title"]')?.textContent?.trim() ?? '',
          price: el.querySelector('[data-testid="price"]')?.textContent?.trim() ?? '0',
          year: el.querySelector('[data-testid="year"]')?.textContent?.trim() ?? '0',
          km: el.querySelector('[data-testid="km"]')?.textContent?.trim() ?? '0',
          city: el.querySelector('[data-testid="city"]')?.textContent?.trim() ?? '',
          img: el.querySelector('img')?.getAttribute('src') ?? '',
          href: (el as HTMLAnchorElement).href ?? '',
        }))
      )

      for (const item of items) {
        if (!item.id || !item.price) continue
        const [make, ...modelParts] = item.title.split(' ')
        listings.push({
          externalId: item.id,
          source: 'yad2',
          url: item.href || `https://www.yad2.co.il/item/${item.id}`,
          title: item.title,
          make: normalizeMake(make),
          model: modelParts.join(' '),
          year: normalizeYear(item.year),
          mileage: normalizeMileage(item.km),
          price: normalizePrice(item.price),
          city: normalizeCity(item.city),
          images: item.img ? [item.img] : [],
        })
      }
    } finally {
      await ctx.close()
    }

    return listings.filter(l => l.images.length > 0)
  },

  async fetchDetails(url: string): Promise<Partial<Listing>> {
    const ctx = await newStealthContext()
    const page = await ctx.newPage()
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await randomDelay(2000, 4000)
      const images = await page.$$eval('img[data-testid="carousel-image"]', imgs => imgs.map(i => (i as HTMLImageElement).src))
      const description = await page.$eval('[data-testid="description"]', el => el.textContent?.trim() ?? '').catch(() => '')
      return { images, description }
    } finally {
      await ctx.close()
    }
  },
}
