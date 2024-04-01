import { NextFunction, Request, Response } from 'express'
import { Controller, Get, Post, Put } from 'mduash/lib/decorators'
import UserService from './service'
import { SuccessRes } from 'mduash'

const prefix = '/user/v1'

@Controller(`${prefix}/auth`)
export class UserAuth {
    // 注册
    @Post('/registry')
    async registry(req: Request, res: Response, next: NextFunction) {
        try {
            await UserService.registry(req.body)
            res.send(SuccessRes('success'))
        } catch (e) {
            next(e)
        }
    }
    // 登录
    @Post('/login')
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(SuccessRes(await UserService.login(req.body)))
        } catch (e) {
            next(e)
        }
    }
}

@Controller(`${prefix}/info`)
export class UserInfo {
    // 获取用户信息
    @Get('/')
    async getDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(SuccessRes(await UserService.getInfo(auth.uid)))
        } catch (e) {
            next(e)
        }
    }
    // 更新用户信息
    @Put('/')
    async editDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth, body } = req
            await UserService.editInfo({ uid: auth.uid, ...body })
            res.send(SuccessRes('success'))
        } catch (e) {
            next(e)
        }
    }
    // 更新密码（暂时没用）
    @Put('/changePwd')
    async changePwd(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth, body } = req
            await UserService.changePwd({ ...auth, ...body })
            res.send(SuccessRes('success'))
        } catch (e) {
            next(e)
        }
    }
}
