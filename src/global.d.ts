// global.d.ts - 全局变量类型声明（TypeScript 开发需要）

import { Request } from 'express'

declare global {
    namespace Express {
        interface Request {
            auth?: any
        }
    }
}
