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
  app.post('/alerts', async (req, reply) => {
    const body = AlertSchema.parse(req.body)
    const alert = await app.prisma.alert.create({ data: body })
    return reply.code(201).send(alert)
  })

  app.delete('/alerts/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await app.prisma.alert.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export default alerts
