import { makePlaywrightConnector } from './_playwrightBase.js'
import type { SearchCriteria } from '../core/types.js'

export const eldanConnector = makePlaywrightConnector({
  name: 'eldan',
  baseUrl: 'https://www.eldan.co.il',
  buildUrl: (c: SearchCriteria) => {
    const q = new URLSearchParams()
    if (c.make)     q.set('make',      c.make)
    if (c.model)    q.set('model',     c.model)
    if (c.yearMin)  q.set('year_from', String(c.yearMin))
    if (c.maxPrice) q.set('price_to',  String(c.maxPrice))
    if (c.maxKm)    q.set('km_to',     String(c.maxKm))
    const qs = q.toString()
    return `https://www.eldan.co.il/he/used-cars${qs ? '?' + qs : ''}`
  },
  waitSelector: '[class*="car-item"], [class*="CarItem"], [class*="vehicle-card"], .car-box',
  extractItems: async (page) => page.$$eval(
    '[class*="car-item"], [class*="CarItem"], [class*="vehicle-card"], .car-box, [class*="result-item"]',
    (els) => els.slice(0, 40).map(el => {
      const a   = el.querySelector('a') as HTMLAnchorElement | null
      const img = el.querySelector('img') as HTMLImageElement | null
      return {
        id:    el.getAttribute('data-id') ?? el.getAttribute('data-vehicle-id') ?? a?.href ?? '',
        title: (el.querySelector('[class*="title"], [class*="name"], h2, h3, h4') as HTMLElement | null)?.innerText?.trim() ?? '',
        price: (el.querySelector('[class*="price"], [class*="Price"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        year:  (el.querySelector('[class*="year"], [class*="Year"]')  as HTMLElement | null)?.innerText?.trim() ?? '',
        km:    (el.querySelector('[class*="km"], [class*="mileage"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        city:  '',
        img:   img?.src ?? img?.getAttribute('data-src') ?? '',
        href:  a?.href ?? '',
      }
    })
  ),
})
