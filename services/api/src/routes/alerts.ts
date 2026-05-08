import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const AlertSchema = z.object({
  userId: z.string(),
  make: z.string().optional(),
  model: z.string().optional(),
  yearMin: z.number().optional(),
  yearMax: z.number().optional(),
  maxPrice: z.number().optional(),
  maxKm: z.number().optional(),
  city: z.string().optional(),
})

const alerts: FastifyPluginAsync = async (app) => {
  // GET /alerts?userId=xxx  — fetch saved alerts for a user
  app.get('/alerts', async (req, reply) => {
    const { userId } = req.query as { userId?: string }
    if (!userId) return reply.code(400).send({ error: 'userId required' })
    const rows = await app.prisma.alert.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
    })
    return rows
  })

  // POST /alerts  — create a new alert
  app.post('/alerts', async (req, reply) => {
    const body = AlertSchema.parse(req.body)
    // Upsert user so FK is satisfied (anonymous users auto-created)
    await app.prisma.user.upsert({
      where: { id: body.userId },
      update: {},
      create: { id: body.userId, email: `anon-${body.userId}@automatch.local` },
    })
    const alert = await app.prisma.alert.create({ data: body })
    return reply.code(201).send(alert)
  })

  // DELETE /alerts/:id  — remove an alert
  app.delete('/alerts/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await app.prisma.alert.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export default alerts
