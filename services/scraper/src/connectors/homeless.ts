import { makePlaywrightConnector } from './_playwrightBase.js'
import type { SearchCriteria } from '../core/types.js'

// homeless.co.il — classifieds board, server-side rendered PHP
export const homelessConnector = makePlaywrightConnector({
  name: 'homeless',
  baseUrl: 'https://www.homeless.co.il',
  buildUrl: (c: SearchCriteria) => {
    const q = new URLSearchParams()
    if (c.make)     q.set('manufacturer', c.make)
    if (c.model)    q.set('model',        c.model)
    if (c.yearMin)  q.set('year_from',    String(c.yearMin))
    if (c.maxPrice) q.set('price_to',     String(c.maxPrice))
    if (c.maxKm)    q.set('km_to',        String(c.maxKm))
    const qs = q.toString()
    return `https://www.homeless.co.il/buy/cars/${qs ? '?' + qs : ''}`
  },
  waitSelector: '.feed-item, .box-item, [class*="listing"], .ad-item',
  extractItems: async (page) => page.$$eval(
    '.feed-item, .box-item, [class*="listing-item"], .ad-item, [id*="item"]',
    (els) => els.slice(0, 40).map(el => {
      const a   = el.querySelector('a[href*="/ad/"], a[href*="/item/"], a') as HTMLAnchorElement | null
      const img = el.querySelector('img') as HTMLImageElement | null
      return {
        id:    el.getAttribute('data-id') ?? el.getAttribute('id') ?? a?.href ?? '',
        title: (el.querySelector('.title, h2, h3, [class*="title"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        price: (el.querySelector('.price, [class*="price"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        year:  (el.querySelector('[class*="year"], .year') as HTMLElement | null)?.innerText?.trim() ?? '',
        km:    (el.querySelector('[class*="km"], .km, [class*="mileage"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        city:  (el.querySelector('.city, [class*="city"], [class*="location"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        img:   img?.src ?? img?.getAttribute('data-src') ?? '',
        href:  a?.href ?? '',
      }
    })
  ),
})
