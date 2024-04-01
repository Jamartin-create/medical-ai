import { NextFunction, Request, Response } from 'express'
import { Controller, Get, Post, Put } from 'mduash/lib/decorators'
import CaseService from './service'
import { SuccessRes } from 'mduash'

const prefix = '/case/v1'

@Controller(`${prefix}/mdCase`)
export class CaseInfo {
    // 创建健康档案
    @Post('/create')
    async createCase(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(
                SuccessRes(await CaseService.createCase({ ...req.body, auth }))
            )
        } catch (e) {
            next(e)
        }
    }

    // AI 分析：分析健康档案
    @Post('/genAnalize')
    async genAnalize(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            await CaseService.analizeCase({ ...req.body, auth }, res)
        } catch (e) {
            next(e)
        }
    }

    // 健康情况反馈（暂时没用）
    @Put('/feedBack')
    async feedback(req: Request, res: Response, next: NextFunction) {
        try {
            await CaseService.caseFeedBack(req.body)
            res.send(SuccessRes('success'))
        } catch (e) {
            next(e)
        }
    }

    // 获取健康档案列表
    @Get('/list')
    async getCaseList(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(
                SuccessRes(
                    await CaseService.getCaseList({ auth, ...req.query })
                )
            )
        } catch (e) {
            next(e)
        }
    }

    // 获取健康档案详情
    @Get('/detail')
    async getCaseDetail(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(SuccessRes(await CaseService.getCaseDetail(req.query)))
        } catch (e) {
            next(e)
        }
    }
}
