import { makePlaywrightConnector } from './_playwrightBase.js'
import type { SearchCriteria } from '../core/types.js'

export const carwizConnector = makePlaywrightConnector({
  name: 'carwiz',
  baseUrl: 'https://www.carwiz.co.il',
  buildUrl: (c: SearchCriteria) => {
    const q = new URLSearchParams()
    if (c.make)     q.set('MakeId',   c.make)
    if (c.model)    q.set('ModelId',  c.model)
    if (c.yearMin)  q.set('YearFrom', String(c.yearMin))
    if (c.maxPrice) q.set('PriceTo',  String(c.maxPrice))
    if (c.maxKm)    q.set('KmTo',     String(c.maxKm))
    const qs = q.toString()
    return `https://www.carwiz.co.il/UsedCars${qs ? '?' + qs : ''}`
  },
  waitSelector: '[class*="CarCard"], [class*="car-card"], [class*="VehicleCard"]',
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
        nextData?.props?.pageProps?.data?.cars ?? []
      if (cars.length > 0) {
        return cars.slice(0, 40).map((car: any) => ({
          id:    String(car.id ?? car.vehicleId ?? car.carId ?? ''),
          title: `${car.make ?? car.manufacturer ?? ''} ${car.model ?? ''}`.trim(),
          price: String(car.price ?? car.Price ?? ''),
          year:  String(car.year ?? car.Year ?? ''),
          km:    String(car.km ?? car.mileage ?? car.Km ?? ''),
          city:  String(car.city ?? car.location ?? ''),
          img:   car.image ?? car.imageUrl ?? car.images?.[0] ?? '',
          href:  car.url ?? car.href ?? `/UsedCar/${car.id}`,
        }))
      }
    }
    return page.$$eval(
      '[class*="CarCard"], [class*="car-card"], [class*="VehicleCard"], [class*="listing-item"]',
      (els) => els.slice(0, 40).map(el => {
        const a = el.querySelector('a') as HTMLAnchorElement | null
        const img = el.querySelector('img') as HTMLImageElement | null
        return {
          id:    el.getAttribute('data-id') ?? a?.href ?? '',
          title: (el.querySelector('[class*="name"], [class*="title"], h2, h3') as HTMLElement | null)?.innerText?.trim() ?? '',
          price: (el.querySelector('[class*="price"], [class*="Price"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          year:  (el.querySelector('[class*="year"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          km:    (el.querySelector('[class*="km"], [class*="mileage"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          city:  (el.querySelector('[class*="city"], [class*="location"]') as HTMLElement | null)?.innerText?.trim() ?? '',
          img:   img?.src ?? '',
          href:  a?.href ?? '',
        }
      })
    )
  },
})
