import PlanModel from '../../../database/models/mdaplan'
import PlanRecordModel from '../../../database/models/mdaplanrecord'
import PlanRecordAnaModel from '../../../database/models/mdaplanrecordana'
import PlanOverviewModel from '../../../database/models/mdaplanoverview'
import PlanReviewModel from '../../../database/models/mdaplanreview'
import { sequelize, transactionAction } from '../../../plugin/sequelize'
import { DataTypes } from 'sequelize'
import { ErrorCode } from '../../../utils/exceptions'
import { beforeCreateOne, beforeUpdateOne } from '../../../utils/database'

const Plan = PlanModel(sequelize, DataTypes)
const PlanRecord = PlanRecordModel(sequelize, DataTypes)
const PlanRecordAna = PlanRecordAnaModel(sequelize, DataTypes)
const PlanOverview = PlanOverviewModel(sequelize, DataTypes)
const PlanReview = PlanReviewModel(sequelize, DataTypes)

PlanRecord.addHook('beforeCreate', (model, _) => {
    model.dataValues.status = 0 // 默认是正常状态 0=进行中，1=已结束，2=已中断
})

type BaseModelT = typeof Plan | typeof PlanRecord | typeof PlanRecordAna | typeof PlanOverview | typeof PlanReview

function BaseDao(model: BaseModelT) {
    return {
        async insertOne(data: any) {
            return await transactionAction(async function (tran) {
                return await model.create(
                    beforeCreateOne(data),
                    { transaction: tran }
                )
            })
        },
        async updateOne(data: any, wrapper: any = {}) {
            return await transactionAction(async function (tran) {
                return await model.update(
                    beforeUpdateOne(data),
                    { where: { uid: data.uid, ...wrapper }, transaction: tran }
                )
            })
        }
    }
}

const PlanDao = BaseDao(Plan)
const PlanRecordDao = BaseDao(PlanRecord)
const PlanRecordAnaDao = BaseDao(PlanRecordAna)
const PlanOverviewDao = BaseDao(PlanOverview)
const PlanReviewDao = BaseDao(PlanReview)


export default class UserService {
    // 新建计划
    static async createPlan(data: any) {
        const { auth, ...others } = data
        if (!others.type || !others.target || !others.cycle) throw ErrorCode.PARAMS_MISS_ERROR
        const startAt = new Date()
        startAt.setDate(startAt.getDate() + 1)
        const plan = await PlanDao.insertOne({ userid: auth.uid, ...others, startAt: startAt.getTime() })
        this.genPlanOverview(auth.uid, plan.uid)
    }

    // 关闭计划
    static async completePlan(data: any) {
        const { uid } = data
        if (!uid) throw ErrorCode.PARAMS_MISS_ERROR
        const plan = await Plan.findOne({ where: { uid } })
        if (!plan) throw ErrorCode.PARAMS_MISS_ERROR
        await PlanDao.updateOne({ uid, endAt: new Date().getTime() })
        this.genPlanReview(uid)
    }

    // 日常打卡
    static async dailyCheck(data: any) {
        const { auth, ...other } = data
        const { planid, diet, sleep, medical } = other
        if (!planid || !diet || !sleep || !medical) throw ErrorCode.PARAMS_MISS_ERROR
        const record = await PlanRecordDao.insertOne({ userid: auth.uid, ...other })
        await this.genDailyPlanNews(record.dataValues.uid)
    }

    // ai 创建计划大纲
    static async genPlanOverview(userid: string, planid: string) {
        console.log(`user: ${userid}, plan: ${planid} 生成记录`)
        await PlanOverviewDao.insertOne({ planid, content: "测试", title: "测试标题" })
    }

    // ai 对计划完成情况进行复盘
    static async genPlanReview(planid: string) {
        console.log(`plan: ${planid}`)
        await PlanReviewDao.insertOne({ planid, tags: "肾结石,腰间盘突出", content: "测试内容" })
    }

    // ai 生成每日计划及资讯
    static async genDailyPlanNews(recordid: string) {
        console.log(`recordid: ${recordid}`)
        await PlanRecordAnaDao.insertOne({ recordid, content: "测试内容", genAt: new Date().getTime() })
    }

    // 获取计划清单
    static async getPlanList(data: any) {
        const { auth } = data
        // TODO: 分页
        return await Plan.findAll({ where: { userid: auth.uid } })
    }

    // 获取计划详情
    static async getPlanDetail(data: any) {
        const { uid } = data
        const plan = await Plan.findOne({ where: { uid } })
        const planOverview = await PlanOverview.findOne({ where: { planid: uid } })
        const planReview = await PlanReview.findOne({ where: { planid: uid } })
        if (!plan) throw ErrorCode.NOT_FOUND_CASE_ERROR
        if (planOverview) plan.dataValues.planOverview = planOverview.dataValues
        if (planReview) plan.dataValues.planReview = planReview.dataValues
        return plan.dataValues
    }

    // 获取打卡记录列表
    static async getPlanRecordList(data: any) {
        // TODO: 分页
        const { planid } = data
        return await PlanRecord.findAll({ where: { planid } })
    }

    // 获取打卡记录详情 
    static async getPlanRecordDetail(data: any) {
        const { uid } = data
        const record = await PlanRecord.findOne({ where: { uid } })
        const recordAna = await PlanRecordAna.findOne({ where: { recordid: uid } })
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

}