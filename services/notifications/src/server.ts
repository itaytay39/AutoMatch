import { startNotifWorker } from './queue.js'

console.log('[notifications] starting worker...')
startNotifWorker()
console.log('[notifications] worker ready')
