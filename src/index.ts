import { getServer } from './plugin/express'
import { catchException } from './utils/exceptions'
import { connect } from './plugin/sequelize'
import routes from './routes'

connect() // 连接数据库

const server = getServer()

server.init()

server.app.use(routes) // 挂载路由
server.app.use(catchException) // 全局异常捕获

server.start()

console.log('Mdu-Express 模板')
