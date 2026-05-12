import { makePlaywrightConnector } from './_playwrightBase.js'
import type { SearchCriteria } from '../core/types.js'

export const freesbeConnector = makePlaywrightConnector({
  name: 'freesbe',
  baseUrl: 'https://www.freesbe.com',
  buildUrl: (c: SearchCriteria) => {
    const q = new URLSearchParams()
    if (c.make)     q.set('make',     c.make)
    if (c.model)    q.set('model',    c.model)
    if (c.yearMin)  q.set('minYear',  String(c.yearMin))
    if (c.maxPrice) q.set('maxPrice', String(c.maxPrice))
    if (c.maxKm)    q.set('maxKm',    String(c.maxKm))
    const qs = q.toString()
    return `https://www.freesbe.com/cars/used${qs ? '?' + qs : ''}`
  },
  waitSelector: '[class*="CarCard"], [class*="car-card"], [class*="VehicleCard"]',
  extractItems: async (page) => {
    const nextData = await page.evaluate(() => {
      const el = document.getElementById('__NEXT_DATA__')
      if (!el) return null
      try { return JSON.parse(el.textContent ?? '') } catch { return null }
    })
    if (nextData) {
      const vehicles: any[] =
        nextData?.props?.pageProps?.vehicles ??
        nextData?.props?.pageProps?.cars ??
        nextData?.props?.pageProps?.data ?? []
      if (vehicles.length > 0) {
        return vehicles.slice(0, 40).map((v: any) => ({
          id:    String(v.id ?? v.stockNumber ?? v.vin ?? ''),
          title: `${v.make ?? v.brand ?? ''} ${v.model ?? ''}`.trim(),
          price: String(v.price ?? v.salePrice ?? ''),
          year:  String(v.year ?? v.modelYear ?? ''),
          km:    String(v.km ?? v.mileage ?? ''),
          city:  String(v.city ?? v.branch ?? ''),
          img:   v.mainImage ?? v.images?.[0] ?? v.thumbnail ?? '',
          href:  v.url ?? `/cars/used/${v.id}`,
        }))
      }
    }
    return page.$$eval(
      '[class*="CarCard"], [class*="car-card"], [class*="VehicleCard"], [class*="vehicle-item"]',
      (els) => els.slice(0, 40).map(el => {
        const a = el.querySelector('a') as HTMLAnchorElement | null
        const img = el.querySelector('img') as HTMLImageElement | null
        return {
          id:    el.getAttribute('data-id') ?? a?.href ?? '',
          title: (el.querySelector('[class*="title"], [class*="name"], h2, h3') as HTMLElement | null)?.innerText?.trim() ?? '',
          price: (el.querySelector('[class*="price"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          year:  (el.querySelector('[class*="year"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          km:    (el.querySelector('[class*="km"], [class*="mileage"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          city:  (el.querySelector('[class*="city"], [class*="branch"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          img:   img?.src ?? '',
          href:  a?.href ?? '',
        }
      })
    )
  },
})
