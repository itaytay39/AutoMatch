import axios from 'axios'
import * as cheerio from 'cheerio'
import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

const HEADERS = { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'he-IL,he;q=0.9' }

export function makeAxiosConnector(opts: {
  name: string
  baseUrl: string
  searchPath: (c: SearchCriteria) => string
  parseItems: ($: cheerio.CheerioAPI) => Array<{
    id: string; title: string; price: string; year: string; km: string; city: string; img: string; href: string
  }>
  detailImages?: ($: cheerio.CheerioAPI) => string[]
  detailDesc?: ($: cheerio.CheerioAPI) => string
}): CarConnector {
  return {
    name: opts.name,
    baseUrl: opts.baseUrl,

    async search(criteria: SearchCriteria): Promise<Listing[]> {
      const url = opts.baseUrl + opts.searchPath(criteria)
      const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 })
      const $ = cheerio.load(data)
      const listings: Listing[] = []

      for (const item of opts.parseItems($)) {
        if (!item.id?.trim() || !item.price?.trim() || !item.title?.trim()) continue
        const price = normalizePrice(item.price)
        const year = normalizeYear(item.year)
        if (!price || !year) continue
        const [make, ...modelParts] = item.title.trim().split(' ')
        if (!make) continue
        listings.push({
          externalId: item.id.trim(),
          source: opts.name,
          url: item.href?.startsWith('http') ? item.href : opts.baseUrl + (item.href ?? ''),
          title: item.title.trim(),
          make: normalizeMake(make),
          model: modelParts.join(' '),
          year,
          mileage: normalizeMileage(item.km),
          price,
          city: normalizeCity(item.city),
          images: item.img ? [item.img] : [],
        })
      }
      return listings.filter(l => l.images.length > 0)
    },

    async fetchDetails(url: string): Promise<Partial<Listing>> {
      const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 })
      const $ = cheerio.load(data)
      const images = opts.detailImages ? opts.detailImages($) : $('img').map((_, el) => $(el).attr('src') ?? '').get().filter(s => s.includes('photo') || s.includes('img'))
      const description = opts.detailDesc ? opts.detailDesc($) : $('.description, .details').first().text().trim()
      return { images, description }
    },
  }
}
