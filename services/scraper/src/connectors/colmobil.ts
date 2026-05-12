import { makePlaywrightConnector } from './_playwrightBase.js'
import type { SearchCriteria } from '../core/types.js'

export const colmobilConnector = makePlaywrightConnector({
  name: 'colmobil',
  baseUrl: 'https://www.colmobil.co.il',
  buildUrl: (c: SearchCriteria) => {
    const q = new URLSearchParams()
    if (c.make)     q.set('brand',    c.make)
    if (c.model)    q.set('model',    c.model)
    if (c.yearMin)  q.set('yearFrom', String(c.yearMin))
    if (c.maxPrice) q.set('maxPrice', String(c.maxPrice))
    const qs = q.toString()
    return `https://www.colmobil.co.il/trade/cars${qs ? '?' + qs : ''}`
  },
  waitSelector: '[class*="car-card"], [class*="CarCard"], [class*="vehicle"]',
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
        nextData?.props?.pageProps?.stock ?? []
      if (cars.length > 0) {
        return cars.slice(0, 40).map((car: any) => ({
          id:    String(car.id ?? car.stockNumber ?? ''),
          title: `${car.brand ?? car.make ?? ''} ${car.model ?? ''}`.trim(),
          price: String(car.price ?? car.salePrice ?? ''),
          year:  String(car.year ?? car.modelYear ?? ''),
          km:    String(car.km ?? car.mileage ?? ''),
          city:  String(car.city ?? car.branchName ?? ''),
          img:   car.mainImage ?? car.image ?? car.images?.[0] ?? '',
          href:  car.url ?? `/trade/cars/${car.id}`,
        }))
      }
    }
    return page.$$eval(
      '[class*="car-card"], [class*="CarCard"], [class*="vehicle-item"]',
      (els) => els.slice(0, 40).map(el => {
        const a = el.querySelector('a') as HTMLAnchorElement | null
        const img = el.querySelector('img') as HTMLImageElement | null
        return {
          id:    el.getAttribute('data-id') ?? a?.href ?? '',
          title: (el.querySelector('[class*="title"], [class*="name"], h2, h3') as HTMLElement | null)?.innerText?.trim() ?? '',
          price: (el.querySelector('[class*="price"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          year:  (el.querySelector('[class*="year"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          km:    (el.querySelector('[class*="km"], [class*="mileage"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          city:  '',
          img:   img?.src ?? '',
          href:  a?.href ?? '',
        }
      })
    )
  },
})
