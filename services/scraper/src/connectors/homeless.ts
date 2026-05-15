import axios from 'axios'
import * as cheerio from 'cheerio'
import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

// homeless.co.il — server-rendered PHP classifieds board
// Uses axios + cheerio (much faster and more reliable than Playwright for SSR sites)

const BASE = 'https://www.homeless.co.il'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
  'Referer': 'https://www.homeless.co.il/',
}

function buildUrl(c: SearchCriteria): string {
  const q = new URLSearchParams()
  if (c.make)     q.set('manufacturer', c.make)
  if (c.model)    q.set('model',        c.model)
  if (c.yearMin)  q.set('year_from',    String(c.yearMin))
  if (c.yearMax)  q.set('year_to',      String(c.yearMax))
  if (c.maxPrice) q.set('price_to',     String(c.maxPrice))
  if (c.maxKm)    q.set('km_to',        String(c.maxKm))
  const qs = q.toString()
  return `${BASE}/buy/cars${qs ? '?' + qs : ''}`
}

function parseListings($: cheerio.CheerioAPI): Listing[] {
  const listings: Listing[] = []

  // Try multiple possible list containers
  const selectors = [
    '.feed-item', '.box-item', '.search-item',
    '[class*="ad-item"]', '[class*="listing-item"]',
    '[class*="feed-item"]', 'article.item',
    '.item-box', '.car-item',
  ]

  let items = $([]).add([])
  for (const sel of selectors) {
    const found = $(sel)
    if (found.length > 0) { items = found; break }
  }

  // Fallback: look for links to car ads
  if (items.length === 0) {
    $('a[href*="/item/"], a[href*="/ad/"]').each((_, el) => {
      const $el = $(el)
      const href = $el.attr('href') ?? ''
      const id = href.split('/').pop() ?? ''
      const title = ($el.text().trim() || $el.find('img').attr('alt') || '').trim()
      if (id && title) {
        listings.push({
          externalId: id,
          source:     'homeless',
          url:        href.startsWith('http') ? href : `${BASE}${href}`,
          title,
          make:       normalizeMake(title.split(' ')[0] ?? ''),
          model:      title.split(' ').slice(1).join(' '),
          year:       0,
          price:      0,
          images:     [],
        })
      }
    })
    return listings
  }

  items.each((_, el) => {
    const $el = $(el)
    const link  = $el.find('a[href*="/item/"], a[href*="/ad/"], a').first()
    const href  = link.attr('href') ?? ''
    const img   = $el.find('img').first()
    const imgSrc = img.attr('src') ?? img.attr('data-src') ?? img.attr('data-lazy') ?? ''

    const id = $el.attr('data-id') ?? $el.attr('id') ?? href.split('/').pop() ?? ''
    if (!id) return

    const title = ($el.find('.title, h2, h3, [class*="title"]').first().text()
      || link.text()
      || img.attr('alt') || '').trim()
    if (!title) return

    const price   = $el.find('.price, [class*="price"]').first().text()
    const year    = $el.find('[class*="year"], .year').first().text()
    const km      = $el.find('[class*="km"], .km, [class*="mileage"]').first().text()
    const city    = $el.find('.city, [class*="city"], [class*="location"]').first().text()

    const priceNum  = normalizePrice(price)
    const yearNum   = normalizeYear(year)
    if (!priceNum || yearNum < 1990) return

    const [make, ...modelParts] = title.split(' ')
    listings.push({
      externalId: id,
      source:     'homeless',
      url:        href.startsWith('http') ? href : `${BASE}${href}`,
      title,
      make:       normalizeMake(make),
      model:      modelParts.join(' '),
      year:       yearNum,
      mileage:    normalizeMileage(km),
      price:      priceNum,
      city:       normalizeCity(city),
      images:     imgSrc ? [imgSrc] : [],
    })
  })

  return listings.filter(l => l.images.length > 0)
}

export const homelessConnector: CarConnector = {
  name: 'homeless',
  baseUrl: BASE,

  async search(criteria: SearchCriteria): Promise<Listing[]> {
    const url = buildUrl(criteria)
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15_000 })
    const $ = cheerio.load(data)
    return parseListings($)
  },

  async fetchDetails(url: string): Promise<Partial<Listing>> {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15_000 })
    const $ = cheerio.load(data)
    const images = $('img[src*="photo"], img[src*="image"], .gallery img')
      .map((_, el) => $(el).attr('src') ?? '')
      .get()
      .filter(s => s.startsWith('http'))
    const description = $('.description, .details, [class*="description"]').first().text().trim()
    return { images: images.slice(0, 10), description }
  },
}
