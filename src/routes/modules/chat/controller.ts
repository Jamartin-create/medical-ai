import { NextFunction, Request, Response } from 'express'
import { Controller, Get, Post } from 'mduash/lib/decorators'
import ChatService from './service'
import { SuccessRes } from 'mduash'

const prefix = '/chat/v1'

@Controller(`${prefix}/record`)
export class CaseInfo {
    // 创建聊天
    @Post('/create')
    async createChat(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(SuccessRes(await ChatService.createChat({ auth })))
        } catch (e) {
            next(e)
        }
    }

    // 继续聊天
    @Post('/keep')
    async keeponChat(req: Request, res: Response, next: NextFunction) {
        try {
            await ChatService.keeponChat(req.body, res)
        } catch (e) {
            next(e)
        }
    }

    // 离开聊天（暂时没用）
    @Post('/leave')
    async leaveChat(req: Request, res: Response, next: NextFunction) {
        try {
            await ChatService.leaveChat(req.body)
            res.send(SuccessRes('success'))
        } catch (e) {
            next(e)
        }
    }

    // 获取聊天列表
    @Get('/list')
    async getRecordList(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(SuccessRes(await ChatService.getChatRecords({ auth })))
        } catch (e) {
            next(e)
        }
    }

    // 获取聊天详情（暂时没用）
    @Get('/detail')
    async getRecordDetail(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(
                SuccessRes(await ChatService.getChatRecordDetail(req.query))
            )
        } catch (e) {
            next(e)
        }
    }

    // 判断是不是最新的一次对话（主要是防止重复创建无用对话）
    @Get('/lastChat')
    async getLastChat(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(SuccessRes(await ChatService.checkChatIsNew({ auth })))
        } catch (e) {
            next(e)
        }
    }
}
