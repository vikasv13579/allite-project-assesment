import Redis from 'ioredis'
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
export const redisClient = new Redis(redisUrl, {
   maxRetriesPerRequest: null,
   lazyConnect:true,
   enableOfflineQueue:false
})
redisClient.on('connect', () => {
    console.log('Redis Connected Successfully')
})
redisClient.on('error', (err) => {
    if(process.env.NODE_ENV !== 'test'){
        console.error('Redis Connection Error', err)
    }
})