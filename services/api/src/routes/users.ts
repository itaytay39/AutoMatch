import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const RegisterSchema = z.object({ email: z.string().email(), fcmToken: z.string().optional() })
const TokenSchema = z.object({ fcmToken: z.string() })

const users: FastifyPluginAsync = async (app) => {
  app.post('/users', async (req, reply) => {
    const body = RegisterSchema.parse(req.body)
    const user = await app.prisma.user.upsert({
      where: { email: body.email },
      create: body,
      update: { fcmToken: body.fcmToken },
    })
    return reply.code(201).send(user)
  })

  app.patch('/users/:id/fcm-token', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { fcmToken } = TokenSchema.parse(req.body)
    await app.prisma.user.update({ where: { id }, data: { fcmToken } })
    return reply.code(204).send()
  })
}

export default users
