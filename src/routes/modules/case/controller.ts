import { NextFunction, Request, Response } from 'express'
import { Controller, Get, Post, Put } from 'mduash/lib/decorators'
import CaseService from './service'
import { SuccessRes } from 'mduash'

const prefix = '/case/v1'

@Controller(`${prefix}/mdCase`)
export class CaseInfo {
    @Post('/create')
    async createCase(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(SuccessRes(await CaseService.createCase({ ...req.body, auth })))
        } catch (e) {
            next(e)
        }
    }

    @Post('/genAnalize')
    async genAnalize(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            await CaseService.analizeCase({ ...req.body, auth }, res)
        } catch (e) {
            next(e)
        }
    }

    @Put('/feedBack')
    async feedback(req: Request, res: Response, next: NextFunction) {
        try {
            await CaseService.caseFeedBack(req.body)
            res.send(SuccessRes('success'))
        } catch (e) {
            next(e)
        }
    }

    @Get('/list')
    async getCaseList(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(SuccessRes(await CaseService.getCaseList({ auth, ...req.query })))
        } catch (e) {
            next(e)
        }
    }

    @Get('/detail')
    async getCaseDetail(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(SuccessRes(await CaseService.getCaseDetail(req.query)))
        } catch (e) {
            next(e)
        }
    }

}