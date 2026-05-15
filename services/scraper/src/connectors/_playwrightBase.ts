import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { newStealthContext, randomDelay } from '../core/browser.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

export interface PlaywrightConnectorOpts {
  name: string
  baseUrl: string
  buildUrl: (criteria: SearchCriteria) => string
  /** Called after page load — returns raw item objects */
  extractItems: (page: import('playwright').Page) => Promise<RawItem[]>
  /** Optional: extra wait condition before extraction */
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
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })

        if (opts.waitSelector) {
          await page.waitForSelector(opts.waitSelector, {
            timeout: opts.waitTimeout ?? 12_000,
          }).catch(() => {/* page may not have results */})
        } else {
          await randomDelay(2_500, 4_500)
        }

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
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
        await randomDelay(1_500, 3_000)

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
