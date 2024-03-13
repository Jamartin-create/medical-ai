import { NextFunction, Request, Response } from 'express'
import { Controller, Get, Post, Put } from 'mduash/lib/decorators'
import PlanService from './service'
import { SuccessRes } from 'mduash'

const prefix = '/plan/v1'

@Controller(`${prefix}/plan`)
export class PlanController {
    @Get('/')
    async getPlanDetail(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(SuccessRes(await PlanService.getPlanDetail(req.query)))
        } catch (e) {
            next(e)
        }
    }
    @Post('/')
    async createPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(
                SuccessRes(await PlanService.createPlan({ auth, ...req.body }))
            )
        } catch (e) {
            next(e)
        }
    }
    @Post('/overview')
    async genOverview(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            await PlanService.genPlanOverview({ auth, ...req.body }, res)
        } catch (e) {
            next(e)
        }
    }
    @Put('/complete')
    async completePlan(req: Request, res: Response, next: NextFunction) {
        try {
            await PlanService.completePlan(req.body)
            res.send(SuccessRes('success'))
        } catch (e) {
            next(e)
        }
    }
    @Get('/list')
    async getPlanList(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(
                SuccessRes(
                    await PlanService.getPlanList({
                        auth: req.auth,
                        ...req.query
                    })
                )
            )
        } catch (e) {
            next(e)
        }
    }
    @Get('/review')
    async getPlanReview(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(SuccessRes(await PlanService.getPlanReview(req.query)))
        } catch (e) {
            next(e)
        }
    }
    @Get('/todolist')
    async getTodoList(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(SuccessRes(await PlanService.getTodayToDoPlan(req)))
        } catch (e) {
            next(e)
        }
    }
    @Get('/checklist')
    async getCheckList(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(
                SuccessRes(
                    await PlanService.getCheckTodoPlan({ auth, ...req.body })
                )
            )
        } catch (e) {
            next(e)
        }
    }
}

@Controller(`${prefix}/record`)
export class PlanRecordController {
    @Get('/list')
    async getRecordList(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(
                SuccessRes(
                    await PlanService.getPlanRecordList({ auth, ...req.query })
                )
            )
        } catch (e) {
            next(e)
        }
    }
    @Get('/')
    async getRecordDetail(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(
                SuccessRes(await PlanService.getPlanRecordDetail(req.query))
            )
        } catch (e) {
            next(e)
        }
    }
    @Post('/')
    async createRecord(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(
                SuccessRes(await PlanService.dailyCheck({ auth, ...req.body }))
            )
        } catch (e) {
            next(e)
        }
    }
    @Post('/genAdvice')
    async genRecordAdvice(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(
                SuccessRes(await PlanService.genDailyPlanNews(req.body, res))
            )
        } catch (e) {
            next(e)
        }
    }
}
