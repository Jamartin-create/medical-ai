import redis from 'redis'
import config from '../config/index.js'

const redisClient = redis.createClient({
    password: config.redis.password
})

redisClient.on('error', err => console.log('Redis Client Error', err))
redisClient.on('connect', () => console.log('Redis Client Connected'))

redisClient.connect()

export default redisClient
