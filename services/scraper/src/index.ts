import { startWorker, startCron } from './core/scheduler.js'

console.log('Starting scraper worker...')
startWorker()
await startCron()
console.log('Scraper ready — waiting for jobs')
