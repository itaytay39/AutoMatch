import axios from 'axios'
import * as cheerio from 'cheerio'
import { CarConnector, SearchCriteria, Listing } from '../core/types.js'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../core/normalizer.js'

// focusnet.co.il — large Israeli classifieds board
// Server-rendered — axios + cheerio

const BASE = 'https://www.focusnet.co.il'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'he-IL,he;q=0.9',
  'Referer': 'https://www.focusnet.co.il/',
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
  return `${BASE}/vehicles/private-cars${qs ? '?' + qs : ''}`
}

function parseListings($: cheerio.CheerioAPI): Listing[] {
  const listings: Listing[] = []

  const selectors = [
    '.item', '.listing-item', '[class*="ad-item"]',
    '[class*="feed-item"]', '[data-id]', 'article',
    '.result-item', '.car-item',
  ]

  let items = $([]).add([])
  for (const sel of selectors) {
    const found = $(sel).filter((_, el) => {
      const $el = $(el)
      return !!($el.find('a').attr('href') ?? $el.attr('data-id'))
    })
    if (found.length > 3) { items = found; break }
  }

  if (items.length === 0) return listings

  items.each((_, el) => {
    const $el  = $(el)
    const link = $el.find('a').first()
    const href = link.attr('href') ?? $el.attr('data-href') ?? ''
    const img  = $el.find('img').first()
    const imgSrc = img.attr('src') ?? img.attr('data-src') ?? img.attr('data-lazy') ?? ''

    const id = $el.attr('data-id') ?? $el.attr('id') ?? href.split('/').pop() ?? ''
    if (!id) return

    const title = ($el.find('.title, h2, h3, h4, [class*="title"]').first().text()
      || link.text() || img.attr('alt') || '').trim()
    if (!title) return

    const price = $el.find('.price, [class*="price"]').first().text()
    const year  = $el.find('[class*="year"]').first().text()
    const km    = $el.find('[class*="km"], [class*="mileage"]').first().text()
    const city  = $el.find('[class*="city"], [class*="location"]').first().text()

    const priceNum = normalizePrice(price)
    const yearNum  = normalizeYear(year)
    if (!priceNum || yearNum < 1990) return

    const [make, ...modelParts] = title.split(' ')
    listings.push({
      externalId: id,
      source:     'focusnet',
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

export const focusnetConnector: CarConnector = {
  name: 'focusnet',
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
    const images = $('img[src*="photo"], img[src*="img"], .gallery img, [class*="gallery"] img')
      .map((_, el) => $(el).attr('src') ?? '')
      .get()
      .filter(s => s.startsWith('http'))
    const description = $('.description, .details, [class*="description"]').first().text().trim()
    return { images: images.slice(0, 10), description }
  },
}
