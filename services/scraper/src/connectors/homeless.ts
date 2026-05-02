import axios from 'axios'
import * as cheerio from 'cheerio'
import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

export const homelessConnector: CarConnector = {
  name: 'homeless',
  baseUrl: 'https://www.homeless.co.il',

  async search(criteria: SearchCriteria): Promise<Listing[]> {
    const params = new URLSearchParams({ cat: 'cars', ...(criteria.make && { manufacturer: criteria.make }) })
    const { data } = await axios.get(`https://www.homeless.co.il/vehicles/?${params}`, {
      headers: { 'Accept-Language': 'he-IL', 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000,
    })
    const $ = cheerio.load(data)
    const listings: Listing[] = []

    $('.feed-item, .listing-item').each((_, el) => {
      const id = $(el).attr('data-id') ?? $(el).attr('id') ?? ''
      const title = $(el).find('.title, h2').first().text().trim()
      const priceRaw = $(el).find('.price').first().text()
      const yearRaw = $(el).find('.year').first().text()
      const kmRaw = $(el).find('.km, .mileage').first().text()
      const city = $(el).find('.city, .location').first().text().trim()
      const img = $(el).find('img').first().attr('src') ?? ''
      const href = $(el).find('a').first().attr('href') ?? ''

      if (!id || !priceRaw) return
      const [make, ...modelParts] = title.split(' ')
      listings.push({
        externalId: id,
        source: 'homeless',
        url: href.startsWith('http') ? href : `https://www.homeless.co.il${href}`,
        title,
        make: normalizeMake(make),
        model: modelParts.join(' '),
        year: normalizeYear(yearRaw),
        mileage: normalizeMileage(kmRaw),
        price: normalizePrice(priceRaw),
        city: normalizeCity(city),
        images: img ? [img] : [],
      })
    })

    return listings.filter(l => l.images.length > 0)
  },

  async fetchDetails(url: string): Promise<Partial<Listing>> {
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 })
    const $ = cheerio.load(data)
    const images = $('img.gallery-img, .photo-gallery img').map((_, el) => $(el).attr('src') ?? '').get().filter(Boolean)
    const description = $('.description, .item-description').first().text().trim()
    return { images, description }
  },
}
