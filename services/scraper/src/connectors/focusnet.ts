import { makePlaywrightConnector } from './_playwrightBase.js'
import type { SearchCriteria } from '../core/types.js'

// focusnet.co.il — large classifieds board
export const focusnetConnector = makePlaywrightConnector({
  name: 'focusnet',
  baseUrl: 'https://www.focusnet.co.il',
  buildUrl: (c: SearchCriteria) => {
    const q = new URLSearchParams()
    if (c.make)     q.set('manufacturer', c.make)
    if (c.model)    q.set('model',        c.model)
    if (c.yearMin)  q.set('year_from',    String(c.yearMin))
    if (c.maxPrice) q.set('price_to',     String(c.maxPrice))
    if (c.maxKm)    q.set('km_to',        String(c.maxKm))
    const qs = q.toString()
    return `https://www.focusnet.co.il/vehicles/private-cars${qs ? '?' + qs : ''}`
  },
  waitSelector: '.item, .listing-item, [class*="ad-item"], [class*="feed-item"]',
  extractItems: async (page) => page.$$eval(
    '.item, .listing-item, [class*="ad-item"], [class*="feed-item"], [data-id]',
    (els) => els.slice(0, 40).map(el => {
      const a   = el.querySelector('a') as HTMLAnchorElement | null
      const img = el.querySelector('img') as HTMLImageElement | null
      return {
        id:    el.getAttribute('data-id') ?? el.getAttribute('id') ?? a?.href ?? '',
        title: (el.querySelector('.title, h2, h3, [class*="title"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        price: (el.querySelector('.price, [class*="price"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        year:  (el.querySelector('[class*="year"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        km:    (el.querySelector('[class*="km"], [class*="mileage"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        city:  (el.querySelector('[class*="city"], [class*="location"]') as HTMLElement | null)?.innerText?.trim() ?? '',
        img:   img?.src ?? img?.getAttribute('data-src') ?? '',
        href:  a?.href ?? '',
      }
    })
  ),
})
