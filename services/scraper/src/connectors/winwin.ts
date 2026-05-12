import { makePlaywrightConnector } from './_playwrightBase.js'
import type { SearchCriteria } from '../core/types.js'

export const winwinConnector = makePlaywrightConnector({
  name: 'winwin',
  baseUrl: 'https://www.winwin.co.il',
  buildUrl: (c: SearchCriteria) => {
    const q = new URLSearchParams()
    if (c.make)     q.set('make',     c.make)
    if (c.model)    q.set('model',    c.model)
    if (c.yearMin)  q.set('yearFrom', String(c.yearMin))
    if (c.maxPrice) q.set('priceTo',  String(c.maxPrice))
    if (c.maxKm)    q.set('kmTo',     String(c.maxKm))
    const qs = q.toString()
    return `https://www.winwin.co.il/used-cars${qs ? '?' + qs : ''}`
  },
  waitSelector: '[class*="car"], [class*="Car"], [class*="vehicle"], [class*="listing"]',
  extractItems: async (page) => {
    const nextData = await page.evaluate(() => {
      const el = document.getElementById('__NEXT_DATA__')
      if (!el) return null
      try { return JSON.parse(el.textContent ?? '') } catch { return null }
    })
    if (nextData) {
      const cars: any[] =
        nextData?.props?.pageProps?.cars ??
        nextData?.props?.pageProps?.vehicles ??
        nextData?.props?.pageProps?.data ??
        nextData?.props?.pageProps?.listings ?? []
      if (cars.length > 0) {
        return cars.slice(0, 40).map((v: any) => ({
          id:    String(v.id ?? v.carId ?? v.vehicleId ?? v.stockNumber ?? ''),
          title: [v.make ?? v.brand ?? v.manufacturer, v.model].filter(Boolean).join(' '),
          price: String(v.price ?? v.salePrice ?? v.listPrice ?? ''),
          year:  String(v.year ?? v.modelYear ?? ''),
          km:    String(v.km ?? v.mileage ?? v.kilometers ?? ''),
          city:  String(v.city ?? v.location ?? v.branch ?? ''),
          img:   v.mainImage ?? v.image ?? v.images?.[0] ?? v.thumbnail ?? '',
          href:  v.url ?? v.link ?? `/winwin/${v.id}`,
        }))
      }
    }
    return page.5342eval(
      '[class*="car-card"], [class*="CarCard"], [class*="vehicle-card"], [class*="VehicleCard"], [class*="listing-item"], [class*="item-card"]',
      (els) => els.slice(0, 40).map(el => {
        const a   = el.querySelector('a') as HTMLAnchorElement | null
        const img = el.querySelector('img') as HTMLImageElement | null
        return {
          id:    el.getAttribute('data-id') ?? el.getAttribute('data-vehicle-id') ?? a?.href ?? '',
          title: (el.querySelector('[class*="title"],[class*="name"],h2,h3,h4') as HTMLElement | null)?.innerText?.trim() ?? '',
          price: (el.querySelector('[class*="price"],[class*="Price"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          year:  (el.querySelector('[class*="year"],[class*="Year"]')  as HTMLElement | null)?.innerText?.trim() ?? '',
          km:    (el.querySelector('[class*="km"],[class*="mileage"],[class*="Km"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          city:  (el.querySelector('[class*="city"],[class*="location"],[class*="branch"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          img:   img?.src ?? img?.getAttribute('data-src') ?? '',
          href:  a?.href ?? '',
        }
      })
    )
  },
})
