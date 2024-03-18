import PlanModel from '../../../database/models/mdaplan'
import PlanRecordModel from '../../../database/models/mdaplanrecord'
import PlanRecordAnaModel from '../../../database/models/mdaplanrecordana'
import PlanOverviewModel from '../../../database/models/mdaplanoverview'
import PlanReviewModel from '../../../database/models/mdaplanreview'
import { sequelize, transactionAction } from '../../../plugin/sequelize'
import { DataTypes, QueryTypes } from 'sequelize'
import { ErrorCode } from '../../../utils/exceptions'
import { beforeCreateOne, beforeUpdateOne } from '../../../utils/database'
import Prompts, { deafultPlanReviewGenPrompt } from '../prompts'
import { getPageParams, ie } from '../../../utils/tools'
import { Response } from 'express'
import { Op } from 'sequelize'

const Plan = PlanModel(sequelize, DataTypes)
const PlanRecord = PlanRecordModel(sequelize, DataTypes)
const PlanRecordAna = PlanRecordAnaModel(sequelize, DataTypes)
const PlanOverview = PlanOverviewModel(sequelize, DataTypes)
const PlanReview = PlanReviewModel(sequelize, DataTypes)

export type TargetInfoT = {
    cycle: string // 周期
    target: string // 目标
    toString: () => string
}

Plan.addHook('beforeCreate', (model, _) => {
    model.dataValues.status = 0 // 默认是正常状态 0=进行中，1=已结束，2=已中断
})

type BaseModelT =
    | typeof Plan
    | typeof PlanRecord
    | typeof PlanRecordAna
    | typeof PlanOverview
    | typeof PlanReview

function BaseDao(model: BaseModelT) {
    return {
        async insertOne(data: any) {
            return await transactionAction(async function (tran) {
                return await model.create(beforeCreateOne(data), {
                    transaction: tran
                })
            })
        },
        async updateOne(data: any, wrapper: any = {}) {
            return await transactionAction(async function (tran) {
                return await model.update(beforeUpdateOne(data), {
                    where: { uid: data.uid, ...wrapper },
                    transaction: tran
                })
            })
        },
        // 获取一条数据
        async selectOne(data: any) {
            return await model.findOne({ where: data.wrp, ...data.options })
        },
        // 获取多条数据
        async selectList(data: any) {
            return await model.findAll({ where: data.wrp, ...data.options })
        }
    }
}

export const PlanDao = BaseDao(Plan)
export const PlanRecordDao = BaseDao(PlanRecord)
export const PlanRecordAnaDao = BaseDao(PlanRecordAna)
export const PlanOverviewDao = BaseDao(PlanOverview)
export const PlanReviewDao = BaseDao(PlanReview)

export default class PlanService {
    // 新建计划
    static async createPlan(data: any) {
        const { auth, ...others } = data
        if (ie(others.type) || ie(others.target) || ie(others.cycle))
            throw ErrorCode.PARAMS_MISS_ERROR
        const startAt = new Date()

        // 开始日期是创建日期的后一天
        startAt.setHours(0, 0, 0, 0)
        return await PlanDao.insertOne({
            userid: auth.uid,
            ...others,
            startAt: startAt.getTime()
        })
    }

    // 关闭计划
    static async completePlan(data: any) {
        const { uid } = data
        if (!uid) throw ErrorCode.PARAMS_MISS_ERROR
        const plan = await Plan.findOne({ where: { uid } })
        if (!plan) throw ErrorCode.PARAMS_MISS_ERROR
        await PlanDao.updateOne({ uid, endAt: new Date().getTime(), status: 1 })
        this.genPlanReview(uid)
    }

    // 日常打卡
    static async dailyCheck(data: any) {
        const { auth, ...other } = data
        const { planid, diet, sleep, medical } = other
        if (!planid || !diet || !sleep || !medical)
            throw ErrorCode.PARAMS_MISS_ERROR
        return await PlanRecordDao.insertOne({
            userid: auth.uid,
            ...other
        })
    }

    // ai 创建计划大纲
    static async genPlanOverview(data: any, res: Response) {
        const { auth, planid } = data
        console.log(`user: ${auth.uid}, plan: ${planid} 生成记录`)

        const { title, ...other } = await Prompts.getChatPlanOverview(
            planid,
            res
        )

        await PlanDao.updateOne({ uid: planid, title })
        await PlanOverviewDao.insertOne({ planid, ...other })
    }

    // ai 对计划完成情况进行复盘
    static async genPlanReview(planid: string) {
        console.log(`plan: ${planid}`)

        const { tags, content } = await Prompts.getPlanReview(
            await deafultPlanReviewGenPrompt(planid)
        )

        await PlanReviewDao.insertOne({ planid, tags, content })
    }

    // 每日打卡后的 ai 分析
    static async genDailyPlanNews(data: any, res: Response) {
        console.log(`recordid: ${data.recordid}`)

        const content = await Prompts.getDailyRecordAnalize(data.recordid, res)

        await PlanRecordAnaDao.insertOne({
            recordid: data.record,
            content,
            genAt: new Date().getTime()
        })
    }

    // 获取计划清单
    static async getPlanList(data: any) {
        const { auth, status } = data
        if (ie(status)) throw ErrorCode.PARAMS_MISS_ERROR
        // 获取分页参数
        const { order, getPageResult } = getPageParams(data)

        const where = { userid: auth.uid, status }
        // 如果 status 是 -1 表示全部，则不需要这个查询 flag
        if (status == -1) delete where.status

        const list = await Plan.findAll({
            where,
            ...order,
            order: [['createdAt', 'DESC']]
        })
        const total = await Plan.count({ where })

        return getPageResult(list, total)
    }

    // 获取计划详情
    static async getPlanDetail(data: any) {
        const { uid } = data
        const plan = await Plan.findOne({ where: { uid } })
        const planOverview = await PlanOverview.findOne({
            where: { planid: uid }
        })
        const planReview = await PlanReview.findOne({ where: { planid: uid } })
        if (!plan) throw ErrorCode.NOT_FOUND_CASE_ERROR
        if (planOverview) plan.dataValues.planOverview = planOverview.dataValues
        if (planReview) plan.dataValues.planReview = planReview.dataValues
        return plan.dataValues
    }

    // 获取打卡记录列表
    static async getPlanRecordList(data: any) {
        const { planid, month: m, auth } = data
        const month = parseInt(m, 10)
        if (month < 1 || month > 12) throw ErrorCode.PARAMS_NOT_CORRECT_ERROR
        const wrp: any = {}
        if (planid) wrp.planid = planid
        if (month) {
            const isLastMonth = month === 12
            const year = new Date().getFullYear()
            const endYear = isLastMonth ? year + 1 : year
            const endMonth = isLastMonth ? 1 : month + 1
            const s = new Date(`${year}-${month}-01 00:00:00`)
            const e = new Date(`${endYear}-${endMonth}-01 00:00:00`)
            wrp.createdAt = {
                [Op.between]: [s, e]
            }
        }

        if (!wrp.planid) {
            const planList = (
                await PlanDao.selectList({ wrp: { userid: auth.uid } })
            ).map(item => item.dataValues.uid)
            wrp.planid = {
                [Op.in]: planList
            }
        }

        return await PlanRecord.findAll({ where: wrp })
    }

    // 获取打卡记录详情
    static async getPlanRecordDetail(data: any) {
        const { uid } = data
        const record = await PlanRecord.findOne({ where: { uid } })
        const recordAna = await PlanRecordAna.findOne({
            where: { recordid: uid }
        })
        if (!record) throw ErrorCode.NOT_FOUND_PLAN_RECORD_ERROR
        if (recordAna) record.dataValues.recordAna = recordAna.dataValues
        console.log(recordAna?.dataValues)
        return record.dataValues
    }

    // 获取计划总结
    static async getPlanReview(data: any) {
        const { planid } = data

        return await PlanReview.findOne({ where: { planid } })
    }

    // 获取用户今日的打卡任务
    static async getTodayToDoPlan(data: any) {
        const { auth } = data

        // 获取今日要打卡的计划（查询条件：当前用户创建的计划，计划的打卡状态为进行中=0）
        const ret = await PlanDao.selectList({
            wrp: { userid: auth.uid, status: 0 },
            options: {
                attributes: ['id', 'uid', 'title']
            }
        })
        return ret
    }

    // 获取今日已经打卡的任务
    static async getCheckTodoPlan(data: any) {
        const s = new Date()
        s.setHours(0, 0, 0, 0)
        const e = new Date()
        e.setHours(23, 59, 59, 999)

        const ret = (await this.getTodayToDoPlan(data)).map(
            item => item.dataValues.uid
        )

        return (
            await PlanRecordDao.selectList({
                wrp: {
                    planid: { [Op.in]: ret },
                    createdAt: { [Op.between]: [s, e] }
                },
                options: { attributes: ['planid'] }
            })
        ).map(item => item.dataValues.planid)
    }

    // 获取计划复盘内容
    static async genPlanReviewPrompts(planid: string): Promise<string> {
        const plan = await PlanDao.selectOne({ wrp: { uid: planid } })
        const planRecords = await PlanRecordDao.selectList({ wrp: { planid } })
        // TODO: 获取每日计划复盘的内容
        if (!plan) throw ErrorCode.NOT_FOUND_PLAN_ERROR

        const { dataValues } = plan
        const recordCount = planRecords.length

        return `
            类型：${dataValues.type === 1 ? '养生' : '康复'}
            目标：${dataValues.target}
            期望完成周期：${dataValues.cycle}       
            真实打卡天数：${recordCount}
            每日打卡信息：${planRecords.map(({ dataValues: record }) => `日期：${record.createAt};睡眠：${record.sleep};用药：${record.medical};饮食：${record.diet}\n`)}
        `
    }

    // 获取七日内的打卡情况（统计）
    static async getRecordStatistic(data: any) {
        const { auth } = data

        // TODO: Refactor
        try {
            const sql = `
                SELECT
                    date_list.date AS date,
                    COALESCE(COUNT(DISTINCT p.uid), 0) AS plan_count,
                    COALESCE(COUNT(r.uid), 0) AS actual_count
                FROM
                    (
                        SELECT DATE_SUB(CURDATE(), INTERVAL n DAY) AS date
                        FROM (
                            SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
                            UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
                        ) AS numbers
                    ) AS date_list
                LEFT JOIN
                    mdaPlans p 
                            ON 
                                date_list.date BETWEEN DATE(p.startAt) AND  COALESCE(DATE(p.endAt), '9999-12-31')
                            AND p.userid = '${auth.uid}'
                LEFT JOIN
                    mdaPlanRecords r ON date_list.date = DATE(r.createdAt) AND p.uid = r.planid
                WHERE
                    date_list.date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE() + 1
                GROUP BY
                    date_list.date;
            `
            const res = await sequelize.query(sql, { type: QueryTypes.SELECT })

            return res
        } catch (e) {
            console.log(e)
            var dateArray = []
            var currentDate = new Date()

            // 获取七天前的日期
            var sevenDaysAgo = new Date(currentDate)
            sevenDaysAgo.setDate(currentDate.getDate() - 6)

            // 循环生成日期对象，从七天前到今天
            for (
                var d = new Date(sevenDaysAgo);
                d <= currentDate;
                d.setDate(d.getDate() + 1)
            ) {
                var dateObject = {
                    date: new Date(d),
                    plan_count: 0,
                    actual_count: 0
                }
                dateArray.push(dateObject)
            }

            return dateArray
        }
    }
}
