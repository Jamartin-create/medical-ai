import { NextFunction, Request, Response } from 'express'
import { Controller, Get, Post, Put } from 'mduash/lib/decorators'
import PlanService from './service'
import { SuccessRes } from 'mduash'

const prefix = '/plan/v1'

// 计划部分
@Controller(`${prefix}/plan`)
export class PlanController {
    // 获取计划详情
    @Get('/')
    async getPlanDetail(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(SuccessRes(await PlanService.getPlanDetail(req.query)))
        } catch (e) {
            next(e)
        }
    }
    // 新增计划
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
    // AI 分析：开始生成计划大纲
    @Post('/overview')
    async genOverview(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            await PlanService.genPlanOverview({ auth, ...req.body }, res)
        } catch (e) {
            next(e)
        }
    }
    // 完成计划
    @Put('/complete')
    async completePlan(req: Request, res: Response, next: NextFunction) {
        try {
            await PlanService.completePlan(req.body)
            res.send(SuccessRes('success'))
        } catch (e) {
            next(e)
        }
    }
    // 获取计划列表（分页）
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
    // AI 分析：开始生成复盘报告（暂时废弃）
    @Get('/review')
    async getPlanReview(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(SuccessRes(await PlanService.getPlanReview(req.query)))
        } catch (e) {
            next(e)
        }
    }
    // 获取待办列表
    @Get('/todolist')
    async getTodoList(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(SuccessRes(await PlanService.getTodayToDoPlan(req)))
        } catch (e) {
            next(e)
        }
    }
    // 获取已办列表（用于去重）
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

// 打卡部分
@Controller(`${prefix}/record`)
export class PlanRecordController {
    // 获取打卡记录列表
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
    // 获取打卡记录详情
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
    // 生成打卡记录
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
    // AI 分析：分析打卡内容
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

    // 统计近七天打卡情况
    @Get('/statistic/sevenDays')
    async getStatistic(req: Request, res: Response, next: NextFunction) {
        try {
            const { auth } = req
            res.send(SuccessRes(await PlanService.getRecordStatistic({ auth })))
        } catch (e) {
            next(e)
        }
    }
}
