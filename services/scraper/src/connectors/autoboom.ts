import { makePlaywrightConnector } from './_playwrightBase.js'
import type { SearchCriteria } from '../core/types.js'

export const autoboomConnector = makePlaywrightConnector({
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
  extractItems: async (page) => page.$$eval(
    '[data-item-id], [class*="FeedItem"]:not(header), [class*="feed-item"]:not(header), [class*="listing-item"]',
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
  ),
})
