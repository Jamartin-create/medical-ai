import redis from 'redis'
import config from '../config/index.js'
import Log from './log.js'

// 创建 redis 实例
const redisClient = redis.createClient({
    password: config.redis.password
})

redisClient.on('error', () => Log.error('Redis Client Error')) // 错误监听
redisClient.on('connect', () => Log.success('Redis Client Connected')) // 连接监听

redisClient.connect() // 建立连接

export default redisClient
