import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { analyzeListing } from '../lib/fraud.js'
import { scoreCondition } from '../lib/condition.js'
import { compareToMarket, getSeasonalAlert } from '../lib/market.js'
import { detectAnomalies, buildMarketContext } from '../lib/anomaly.js'
import { checkSalvageRisk } from '../lib/salvage.js'

const HE_MAKE: Record<string, string> = {
  'קיה': 'Kia', 'כיה': 'Kia', 'טויוטה': 'Toyota', 'יונדאי': 'Hyundai',
  'מזדה': 'Mazda', 'מאזדה': 'Mazda', 'ניסן': 'Nissan', 'ניסאן': 'Nissan',
  'הונדה': 'Honda', 'פולקסווגן': 'Volkswagen', 'פורד': 'Ford', 'שברולט': 'Chevrolet',
  'מיצובישי': 'Mitsubishi', 'סובארו': 'Subaru', 'סקודה': 'Skoda', 'אאודי': 'Audi',
  'ב.מ.ו': 'BMW', 'ב.מ.וו': 'BMW', 'מרצדס': 'Mercedes-Benz', 'וולוו': 'Volvo',
  "פיג'ו": 'Peugeot', 'רנו': 'Renault', 'סיטרואן': 'Citroën', 'אופל': 'Opel',
  'פיאט': 'Fiat', 'טסלה': 'Tesla', 'סוזוקי': 'Suzuki', "דאצ'יה": 'Dacia',
  "ג'יפ": 'Jeep', 'לקסוס': 'Lexus', 'סיאט': 'Seat',
}
const HE_MODEL: Record<string, string> = {
  'סטוניק': 'Stonic', 'ספורטאג': 'Sportage', 'סורנטו': 'Sorento', 'ניירו': 'Niro',
  'פיקנטו': 'Picanto', 'קורולה': 'Corolla', 'יאריס': 'Yaris', 'פריוס': 'Prius',
  'טוסון': 'Tucson', 'סנטה פה': 'Santa Fe', 'אלנטרה': 'Elantra', 'קונה': 'Kona',
  'גולף': 'Golf', 'פולו': 'Polo', 'טיגואן': 'Tiguan', 'פאסאט': 'Passat',
  'אוקטביה': 'Octavia', 'קשקאי': 'Qashqai', "ג'וק": 'Juke', 'ליף': 'Leaf',
  'פוקוס': 'Focus', 'פיאסטה': 'Fiesta', 'קוגה': 'Kuga', 'סיויק': 'Civic',
  'מודל 3': 'Model 3', 'מודל y': 'Model Y', 'אאוטלנדר': 'Outlander',
}

function heToEn(word: string): string {
  return HE_MAKE[word] ?? HE_MODEL[word.toLowerCase()] ?? word
}

const SORT_MAP: Record<string, object> = {
  newest:     { createdAt: 'desc' },
  price_asc:  { price: 'asc' },
  price_desc: { price: 'desc' },
  km_asc:     { mileage: 'asc' },
  year_desc:  { year: 'desc' },
}

const SearchSchema = z.object({
  q: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  yearMin: z.coerce.number().optional(),
  yearMax: z.coerce.number().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  maxKm: z.coerce.number().optional(),
  city: z.string().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'km_asc', 'year_desc']).default('newest'),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(50).default(20),
})

function computePriceDelta(l: any): number | null {
  const history: { price: number }[] = l.priceHistory ?? []
  if (history.length < 2) return null
  const oldest = history[0].price
  const newest = history[history.length - 1].price
  return newest - oldest
}

function enrich(l: any, peers: { price: number; mileage: number | null }[] = []) {
  const fraud = analyzeListing(l)
  const condition = scoreCondition({ ...l, ...fraud })
  const market = compareToMarket(l, peers)
  const ctx = buildMarketContext(peers.map(p => ({ ...l, price: p.price, mileage: p.mileage })))
  const anomaly = detectAnomalies(l, ctx.avgPrice ? ctx : { avgPrice: l.price, stdPrice: 0, avgMileage: l.mileage ?? 0, stdMileage: 0 })
  const salvage = checkSalvageRisk(l)
  const priceDelta = computePriceDelta(l)
  return { ...l, ...fraud, condition, market, anomaly, salvage, priceDelta }
}

const listings: FastifyPluginAsync = async (app) => {
  app.get('/listings', async (req, reply) => {
    const query = SearchSchema.parse(req.query)
    const skip = (query.page - 1) * query.limit

    // Normalize free-text query: "קיה סטוניק" → make=Kia, model=Stonic
    let resolvedMake = query.make
    let resolvedModel = query.model
    if (query.q) {
      const words = query.q.trim().split(/\s+/)
      const firstEn = heToEn(words[0])
      const isMake = HE_MAKE[words[0]] ?? Object.values(HE_MAKE).find(v => v.toLowerCase() === firstEn.toLowerCase())
      if (isMake) {
        resolvedMake = firstEn
        if (words.length > 1) resolvedModel = heToEn(words.slice(1).join(' '))
      } else {
        // treat whole query as model/title search
        resolvedModel = words.map(heToEn).join(' ')
      }
    }

    const where = {
      ...(resolvedMake && { make: { equals: resolvedMake, mode: 'insensitive' as const } }),
      ...(resolvedModel && { model: { contains: resolvedModel, mode: 'insensitive' as const } }),
      ...(query.yearMin && { year: { gte: query.yearMin } }),
      ...(query.yearMax && { year: { lte: query.yearMax } }),
      ...(query.minPrice || query.maxPrice ? {
        price: {
          ...(query.minPrice && { gte: query.minPrice }),
          ...(query.maxPrice && { lte: query.maxPrice }),
        }
      } : {}),
      ...(query.maxKm && { mileage: { lte: query.maxKm } }),
      ...(query.city && { city: { contains: query.city, mode: 'insensitive' as const } }),
    }

    const orderBy = SORT_MAP[query.sort] ?? SORT_MAP.newest

    const [rows, total] = await Promise.all([
      app.prisma.listing.findMany({ where, skip, take: query.limit, orderBy, include: { priceHistory: { orderBy: { date: 'asc' }, take: 2 } } }),
      app.prisma.listing.count({ where }),
    ])

    // Build peer groups for market comparison (same make+model±1yr)
    const peerMap = new Map<string, { price: number; mileage: number | null }[]>()
    for (const l of rows) {
      const key = `${l.make}|${l.model}`
      if (!peerMap.has(key)) peerMap.set(key, [])
      peerMap.get(key)!.push({ price: l.price, mileage: l.mileage })
    }

    const enriched = rows.map((l) => {
      const peers = (peerMap.get(`${l.make}|${l.model}`) ?? []).filter(p => p !== l as any)
      return enrich(l, peers)
    })

    const seasonal = getSeasonalAlert()
    return { listings: enriched, total, page: query.page, limit: query.limit, seasonal }
  })

  app.get('/listings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const listing = await app.prisma.listing.findUnique({
      where: { id },
      include: { priceHistory: { orderBy: { date: 'asc' } } },
    })
    if (!listing) return reply.notFound('מודעה לא נמצאה')

    // Fetch peers from DB for market comparison
    const peers = await app.prisma.listing.findMany({
      where: { make: listing.make, model: listing.model, year: { gte: listing.year - 1, lte: listing.year + 1 }, id: { not: id } },
      select: { price: true, mileage: true },
      take: 50,
    })

    return enrich(listing, peers)
  })

  app.get('/listings/:id/similar', async (req, reply) => {
    const { id } = req.params as { id: string }
    const listing = await app.prisma.listing.findUnique({
      where: { id },
      select: { make: true, model: true, fuelType: true },
    })
    if (!listing) return reply.notFound()

    const similar = await app.prisma.listing.findMany({
      where: {
        id: { not: id },
        OR: [
          { make: listing.make, model: listing.model },
          ...(listing.fuelType ? [{ fuelType: listing.fuelType }] : []),
        ],
      },
      select: { id: true, make: true, model: true, year: true, price: true, mileage: true, images: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
    })

    return { listings: similar }
  })

  app.get('/market/seasonal', async () => getSeasonalAlert())
}

export default listings
