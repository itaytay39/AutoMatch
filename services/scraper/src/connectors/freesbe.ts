import { makeAxiosConnector } from './_axiosBase.js'
import type { SearchCriteria } from '../core/types.js'
import * as cheerio from 'cheerio'

export const freesbeConnector = makeAxiosConnector({
  name: 'freesbe',
  baseUrl: 'https://www.freesbe.com',
  searchPath: (c: SearchCriteria) => {
    const q = new URLSearchParams()
    if (c.make) q.set('make', c.make)
    if (c.model) q.set('model', c.model)
    if (c.yearMin) q.set('yearFrom', String(c.yearMin))
    if (c.maxPrice) q.set('priceTo', String(c.maxPrice))
    if (c.maxKm) q.set('kmTo', String(c.maxKm))
    const qs = q.toString()
    return '/cars' + (qs ? '?' + qs : '')
  },
  parseItems: ($: cheerio.CheerioAPI) =>
    $('.listing, .car-item, .vehicle-item, [data-id], [class*="car-card"]').map((_, el) => ({
      id:    $(el).attr('data-id') ?? $(el).find('a').first().attr('href') ?? '',
      title: $(el).find('.title, h2, h3, [class*="title"]').first().text().trim(),
      price: $(el).find('.price, [class*="price"]').first().text(),
      year:  $(el).find('.year, [class*="year"]').first().text(),
      km:    $(el).find('.km, .mileage, [class*="km"]').first().text(),
      city:  $(el).find('.city, .location, [class*="city"]').first().text().trim(),
      img:   $(el).find('img').first().attr('src') ?? '',
      href:  $(el).find('a').first().attr('href') ?? '',
    })).get(),
})
