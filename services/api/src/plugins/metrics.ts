import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    metrics: {
      requestCount: number
      errorCount: number
      scrapeJobsTotal: number
      notificationsSent: number
    }
  }
}

export default fp(async (app) => {
  const metrics = {
    requestCount: 0,
    errorCount: 0,
    scrapeJobsTotal: 0,
    notificationsSent: 0,
  }

  app.decorate('metrics', metrics)

  app.addHook('onRequest', async () => { metrics.requestCount++ })
  app.addHook('onError', async () => { metrics.errorCount++ })

  app.get('/metrics', async () => ({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    ...metrics,
  }))
})
