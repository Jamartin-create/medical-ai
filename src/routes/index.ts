import { Router } from 'express'
import { AppRouter } from 'mduash/lib/decorators'
import './modules/user/controller' // 引入用户模块
import './modules/case/controller' // 引入健康档案模块
import './modules/chat/controller' // 引入chat模块
import './modules/plan/controller' // 引入计划模块

import './resource/oss' // oss 配置
import jwt from '../plugin/jwt' // token 鉴权配置

const routes = Router()

routes.use(jwt.midwareExpressJwt) // 鉴权校验中间件

routes.use(AppRouter.getInstance()) // 挂载路由

export default routes
