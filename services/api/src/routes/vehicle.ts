import type { FastifyPluginAsync } from 'fastify'
import { lookupVehicle, crossCheckMileage } from '../lib/vehicleLookup.js'

const vehicleRoute: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { plate: string }; Querystring: { km?: string } }>(
    '/vehicle/:plate',
    async (req, reply) => {
      const { plate } = req.params
      const listedKm = req.query.km ? parseInt(req.query.km, 10) : null

      const result = await lookupVehicle(plate)

      if (!result.found) {
        return reply.code(404).send({ error: 'vehicle_not_found', signals: result.fraudSignals })
      }

      const kmCheck = listedKm !== null
        ? crossCheckMileage(listedKm, result.record!.lastTestKm)
        : null

      if (kmCheck?.suspicious && kmCheck.reason) {
        result.fraudSignals.unshift(kmCheck.reason)
        result.trustScore = Math.max(0, result.trustScore - 30)
      }

      return {
        record: result.record,
        fraudSignals: result.fraudSignals,
        trustScore: result.trustScore,
        kmMismatch: kmCheck?.suspicious ?? false,
      }
    }
  )
}

export default vehicleRoute
