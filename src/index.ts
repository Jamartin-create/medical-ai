import { getServer } from './plugin/express'
import { catchException } from './utils/exceptions'
import { connect } from './plugin/sequelize'
import routes from './routes'

connect() // 连接数据库

const server = getServer() // 获取服务器实例

server.init() // 服务器初始化

server.app.use(routes) // 挂载路由（挂载接口）
server.app.use(catchException) // 全局异常捕获（因为 Express 的运行机制，route 里的错误一定会抛出到最后，所以在这里捕获是最明智的选择）

server.start() // 启动服务器
