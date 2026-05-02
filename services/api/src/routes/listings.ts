import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { analyzeListing } from '../lib/fraud.js'

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

    const [listings, total] = await Promise.all([
      app.prisma.listing.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
      app.prisma.listing.count({ where }),
    ])

    const enriched = listings.map((l) => ({ ...l, ...analyzeListing(l) }))
    return { listings: enriched, total, page: query.page, limit: query.limit }
  })

  app.get('/listings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const listing = await app.prisma.listing.findUnique({
      where: { id },
      include: { priceHistory: { orderBy: { date: 'asc' } } },
    })
    if (!listing) return reply.notFound('מודעה לא נמצאה')
    return { ...listing, ...analyzeListing(listing) }
  })
}

export default listings
