import express, { Router } from 'express'
import cors from 'cors'
import http from 'http'
import config from '../config'
import Log from './log'

const { server } = config

// Express & http Server
export default class ExpressServer {
  app: express.Application
  server: http.Server
  init: () => void
  start: () => void
  constructor() {
    this.app = express()
    this.server = http.createServer(this.app)
    this.init = () => {
      this.app.use(cors()) // CORS Options
      this.app.use(express.json()) // 处理 body（middleware）
      this.app.use(express.urlencoded({ extended: true }))
      this.app.get('/test/v1/hello', (_, res: express.Response) =>
        res.send('world')
      )
    }
    this.start = () => {
      this.server.listen(server.port, () => {
        Log.success(`Mdu-Express 服务器已启动，监听端口 ${server.port}`)
      })
    }
  }
}

// 获取 Server 实例
export const getServer: () => ExpressServer = (function () {
  let server: null | ExpressServer = null
  return function () {
    if (!server) server = new ExpressServer()
    return server
  }
})()

// 唯一路由
export class AppRouter {
  static router: Router
  static getInstance() {
    if (!AppRouter.router) {
      AppRouter.router = Router()
    }
    return AppRouter.router
  }
}
