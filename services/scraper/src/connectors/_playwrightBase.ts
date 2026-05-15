import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { newStealthContext, randomDelay } from '../core/browser.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

export interface PlaywrightConnectorOpts {
  name: string
  baseUrl: string
  buildUrl: (criteria: SearchCriteria) => string
  extractItems: (page: import('playwright').Page) => Promise<RawItem[]>
  waitSelector?: string
  waitTimeout?: number
}

export interface RawItem {
  id: string
  title: string
  price: string
  year: string
  km: string
  city: string
  img: string
  href: string
  description?: string
}

export function makePlaywrightConnector(opts: PlaywrightConnectorOpts): CarConnector {
  return {
    name: opts.name,
    baseUrl: opts.baseUrl,

    async search(criteria: SearchCriteria): Promise<Listing[]> {
      const url = opts.buildUrl(criteria)
      const ctx = await newStealthContext()
      const page = await ctx.newPage()
      const listings: Listing[] = []

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25_000 })

        // Wait for content — try selector, then fallback to delay
        if (opts.waitSelector) {
          await page.waitForSelector(opts.waitSelector, {
            timeout: opts.waitTimeout ?? 10_000,
          }).catch(() => {})
        }

        // Scroll to trigger lazy-loaded images/content
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
        await randomDelay(1_000, 2_000)

        const items = await opts.extractItems(page)

        for (const item of items) {
          if (!item.id?.trim() || !item.title?.trim()) continue
          const price = normalizePrice(item.price)
          const year  = normalizeYear(item.year)
          if (!price || year < 1990) continue

          const [make, ...rest] = item.title.trim().split(' ')
          if (!make) continue

          listings.push({
            externalId: item.id.trim(),
            source:     opts.name,
            url:        item.href?.startsWith('http') ? item.href : opts.baseUrl + (item.href ?? ''),
            title:      item.title.trim(),
            make:       normalizeMake(make),
            model:      rest.join(' '),
            year,
            mileage:    normalizeMileage(item.km),
            price,
            city:       normalizeCity(item.city),
            images:     item.img ? [item.img] : [],
            description: item.description ?? undefined,
          })
        }
      } catch (err: any) {
        console.warn(`[${opts.name}] search error:`, err.message)
      } finally {
        await ctx.close()
      }

      return listings.filter(l => l.images.length > 0)
    },

    async fetchDetails(url: string): Promise<Partial<Listing>> {
      const ctx = await newStealthContext()
      const page = await ctx.newPage()
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25_000 })
        await randomDelay(1_000, 2_500)

        const images = await page.$$eval(
          'img[src*="photo"], img[src*="image"], img[src*="img"], img[src*="car"], img[src*="vehicle"], .gallery img, [class*="gallery"] img, [class*="slider"] img',
          els => (els as HTMLImageElement[]).map(e => e.src).filter(s => s?.startsWith('http'))
        ).catch(() => [] as string[])

        const description = await page.$eval(
          '[class*="description"], [class*="details"], [class*="info"], .desc',
          el => el.textContent?.trim() ?? ''
        ).catch(() => '')

        return { images: images.slice(0, 10), description }
      } catch {
        return {}
      } finally {
        await ctx.close()
      }
    },
  }
}

// Helper used by several connectors: extract from Next.js __NEXT_DATA__ or fall back to DOM
export async function extractNextDataOrDom(
  page: import('playwright').Page,
  domSelector: string,
  mapNextCar: (v: any) => RawItem,
  mapDomEl: (els: Element[]) => RawItem[],
  nextDataPaths: string[][]
): Promise<RawItem[]> {
  // Try __NEXT_DATA__ first (faster, no DOM parsing)
  const nextData = await page.evaluate(() => {
    const el = document.getElementById('__NEXT_DATA__')
    if (!el) return null
    try { return JSON.parse(el.textContent ?? '') } catch { return null }
  })

  if (nextData) {
    for (const path of nextDataPaths) {
      let node: any = nextData
      for (const key of path) { node = node?.[key] }
      if (Array.isArray(node) && node.length > 0) {
        return node.slice(0, 40).map(mapNextCar)
      }
    }
  }

  // Fall back to DOM extraction
  return page.$$eval(domSelector, (els) => {
    // mapDomEl must be serialisable — use inline arrow fn in each connector
    return (window as any).__domExtract?.(els) ?? []
  }).catch(() => [])
}
