import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { analyzeListing } from '../lib/fraud.js'
import { scoreCondition } from '../lib/condition.js'
import { compareToMarket, getSeasonalAlert } from '../lib/market.js'

const SearchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  yearMin: z.coerce.number().optional(),
  yearMax: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  maxKm: z.coerce.number().optional(),
  city: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(50).default(20),
})

function enrich(l: any, peers: { price: number; mileage: number | null }[] = []) {
  const fraud = analyzeListing(l)
  const condition = scoreCondition({ ...l, ...fraud })
  const market = compareToMarket(l, peers)
  return { ...l, ...fraud, condition, market }
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
      ...(query.maxPrice && { price: { lte: query.maxPrice } }),
      ...(query.maxKm && { mileage: { lte: query.maxKm } }),
      ...(query.city && { city: { contains: query.city, mode: 'insensitive' as const } }),
    }

    const [rows, total] = await Promise.all([
      app.prisma.listing.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
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
