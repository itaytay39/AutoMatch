import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { analyzeListing } from '../lib/fraud.js'
import { scoreCondition } from '../lib/condition.js'
import { compareToMarket, getSeasonalAlert } from '../lib/market.js'
import { detectAnomalies, buildMarketContext } from '../lib/anomaly.js'
import { checkSalvageRisk } from '../lib/salvage.js'

const SORT_MAP: Record<string, object> = {
  newest:     { createdAt: 'desc' },
  price_asc:  { price: 'asc' },
  price_desc: { price: 'desc' },
  km_asc:     { mileage: 'asc' },
  year_desc:  { year: 'desc' },
}

const SearchSchema = z.object({
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

    const where = {
      ...(query.make && { make: { equals: query.make, mode: 'insensitive' as const } }),
      ...(query.model && { model: { contains: query.model, mode: 'insensitive' as const } }),
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

  app.get('/market/seasonal', async () => getSeasonalAlert())
}

export default listings
