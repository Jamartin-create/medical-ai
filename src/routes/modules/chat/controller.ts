import { NextFunction, Request, Response } from 'express'
import { Controller, Get, Post } from 'mduash/lib/decorators'
import ChatService from './service'
import { SuccessRes } from 'mduash'

const prefix = '/chat/v1'

@Controller(`${prefix}/record`)
export class CaseInfo {
    @Post('/create')
    async createChat(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(SuccessRes(await ChatService.createChat({ auth })))
        } catch (e) {
            next(e)
        }
    }

    @Post('/keep')
    async keeponChat(req: Request, res: Response, next: NextFunction) {
        try {
            await ChatService.keeponChat(req.body, res)
        } catch (e) {
            next(e)
        }
    }

    @Post('/leave')
    async leaveChat(req: Request, res: Response, next: NextFunction) {
        try {
            await ChatService.leaveChat(req.body)
            res.send(SuccessRes('success'))
        } catch (e) {
            next(e)
        }
    }

    @Get('/list')
    async getRecordList(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(SuccessRes(await ChatService.getChatRecords({ auth })))
        } catch (e) {
            next(e)
        }
    }

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
